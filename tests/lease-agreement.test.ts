import { describe, it, expect, beforeEach } from "vitest"
import { Chain, type Account, types } from "./test-utils"

describe("lease-agreement contract", () => {
  let chain: Chain
  let deployer: Account
  let owner: Account
  let lessee: Account
  
  beforeEach(() => {
    chain = new Chain()
    deployer = chain.createAccount("deployer")
    owner = chain.createAccount("owner")
    lessee = chain.createAccount("lessee")
    
    // Register an asset first
    chain.callPublic(
        "asset-registration",
        "register-asset",
        [
          types.ascii("Generator G200"),
          types.ascii("Industrial power generator"),
          types.uint(20230501),
          types.uint(25000),
        ],
        owner.address,
    )
  })
  
  it("allows owners to terminate lease agreements", () => {
    // Create a lease first
    chain.callPublic(
        "lease-agreement",
        "create-lease",
        [
          types.uint(1), // asset-id
          types.principal(lessee.address),
          types.uint(20230601), // start-date
          types.uint(20231201), // end-date
          types.uint(1000), // payment-amount
          types.uint(30), // payment-frequency (30 days)
          types.uint(2000), // security-deposit
        ],
        owner.address,
    )
    
    // Then terminate it
    const result = chain.callPublic(
        "lease-agreement",
        "terminate-lease",
        [
          types.uint(1), // lease-id
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
  
  it("allows lessees to terminate lease agreements", () => {
    // Create a lease first
    chain.callPublic(
        "lease-agreement",
        "create-lease",
        [
          types.uint(1), // asset-id
          types.principal(lessee.address),
          types.uint(20230601), // start-date
          types.uint(20231201), // end-date
          types.uint(1000), // payment-amount
          types.uint(30), // payment-frequency (30 days)
          types.uint(2000), // security-deposit
        ],
        owner.address,
    )
    
    // Then terminate it as the lessee
    const result = chain.callPublic(
        "lease-agreement",
        "terminate-lease",
        [
          types.uint(1), // lease-id
        ],
        lessee.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
  
  it("allows owners to extend lease agreements", () => {
    // Create a lease first
    chain.callPublic(
        "lease-agreement",
        "create-lease",
        [
          types.uint(1), // asset-id
          types.principal(lessee.address),
          types.uint(20230601), // start-date
          types.uint(20231201), // end-date
          types.uint(1000), // payment-amount
          types.uint(30), // payment-frequency (30 days)
          types.uint(2000), // security-deposit
        ],
        owner.address,
    )
    
    // Then extend it
    const result = chain.callPublic(
        "lease-agreement",
        "extend-lease",
        [
          types.uint(1), // lease-id
          types.uint(20240601), // new-end-date
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
})

