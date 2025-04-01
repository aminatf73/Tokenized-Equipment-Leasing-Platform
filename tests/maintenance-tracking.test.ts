import { describe, it, expect, beforeEach } from "vitest"
import { Chain, type Account, types } from "./test-utils"

describe("maintenance-tracking contract", () => {
  let chain: Chain
  let deployer: Account
  let owner: Account
  let lessee: Account
  let assetId: number
  
  beforeEach(() => {
    chain = new Chain()
    deployer = chain.createAccount("deployer")
    owner = chain.createAccount("owner")
    lessee = chain.createAccount("lessee")
    
    // Register an asset
    chain.callPublic(
        "asset-registration",
        "register-asset",
        [
          types.ascii("Concrete Mixer CM50"),
          types.ascii("Industrial concrete mixer"),
          types.uint(20230501),
          types.uint(15000),
        ],
        owner.address,
    )
    
    assetId = 1 // Assuming this is the first asset
    
    // Create a lease
    chain.callPublic(
        "lease-agreement",
        "create-lease",
        [
          types.uint(assetId),
          types.principal(lessee.address),
          types.uint(20230601), // start-date
          types.uint(20231201), // end-date
          types.uint(1000), // payment-amount
          types.uint(30), // payment-frequency (30 days)
          types.uint(2000), // security-deposit
        ],
        owner.address,
    )
  })
  
  it("allows owners to create maintenance records", () => {
    const result = chain.callPublic(
        "maintenance-tracking",
        "create-maintenance-record",
        [
          types.uint(assetId),
          types.ascii("Regular oil change and filter replacement"),
          types.uint(500),
          types.some(types.uint(20230801)), // next-maintenance-date
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.uint(1)))
  })
  
  it("prevents non-owners from creating maintenance records", () => {
    const result = chain.callPublic(
        "maintenance-tracking",
        "create-maintenance-record",
        [
          types.uint(assetId),
          types.ascii("Unauthorized maintenance attempt"),
          types.uint(300),
          types.some(types.uint(20230801)),
        ],
        lessee.address,
    )
    
    expect(result.success).toBe(false)
    expect(result.error).toEqual(types.err(types.uint(403)))
  })
  
  it("allows owners to schedule maintenance", () => {
    const result = chain.callPublic(
        "maintenance-tracking",
        "schedule-maintenance",
        [
          types.uint(assetId),
          types.ascii("Annual inspection and certification"),
          types.uint(20230901), // scheduled-date
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.uint(1)))
  })
  
  it("allows owners to complete scheduled maintenance", () => {
    // Schedule maintenance first
    chain.callPublic(
        "maintenance-tracking",
        "schedule-maintenance",
        [
          types.uint(assetId),
          types.ascii("Brake system inspection"),
          types.uint(20230701), // scheduled-date
        ],
        owner.address,
    )
    
    // Then complete it
    const result = chain.callPublic(
        "maintenance-tracking",
        "complete-maintenance",
        [
          types.uint(1), // maintenance-id
          types.uint(750), // cost
          types.some(types.uint(20240701)), // next-maintenance-date
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
  
  it("allows lessees to report maintenance issues", () => {
    // Create a lease first to establish lessee relationship
    chain.callPublic(
        "lease-agreement",
        "create-lease",
        [
          types.uint(assetId),
          types.principal(lessee.address),
          types.uint(20230601),
          types.uint(20231201),
          types.uint(1000),
          types.uint(30),
          types.uint(2000),
        ],
        owner.address,
    )
    
    const result = chain.callPublic(
        "maintenance-tracking",
        "report-maintenance-issue",
        [types.uint(assetId), types.ascii("Engine making unusual noise during operation")],
        lessee.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.uint(1)))
  })
})

