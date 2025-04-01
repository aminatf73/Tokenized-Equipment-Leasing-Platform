import { describe, it, expect, beforeEach } from "vitest"
import { Chain, type Account, types } from "./test-utils"

describe("payment-automation contract", () => {
  let chain: Chain
  let deployer: Account
  let owner: Account
  let lessee: Account
  let leaseId: number
  
  beforeEach(() => {
    chain = new Chain()
    deployer = chain.createAccount("deployer")
    owner = chain.createAccount("owner")
    lessee = chain.createAccount("lessee")
    
    // Register an asset
    chain.callPublic(
        "asset-registration",
        "register-asset",
        [types.ascii("Tractor T100"), types.ascii("Agricultural tractor"), types.uint(20230501), types.uint(45000)],
        owner.address,
    )
    
    // Create a lease
    const leaseResult = chain.callPublic(
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
    
    leaseId = 1 // Assuming this is the first lease
  })
  
  it("allows owners to schedule payments for a lease", () => {
    const result = chain.callPublic("payment-automation", "schedule-payments", [types.uint(leaseId)], owner.address)
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })

  
  it("allows lessees to make payments", () => {
    // Schedule payments first
    chain.callPublic("payment-automation", "schedule-payments", [types.uint(leaseId)], owner.address)
    
    // Make a payment (assuming payment ID 1 is the security deposit)
    const result = chain.callPublic(
        "payment-automation",
        "make-payment",
        [
          types.uint(1), // payment-id
        ],
        lessee.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
  
  it("allows owners to mark payments as late", () => {
    // Schedule payments first
    chain.callPublic("payment-automation", "schedule-payments", [types.uint(leaseId)], owner.address)
    
    // Advance the blockchain past the due date
    chain.mineEmptyBlock(100)
    
    // Mark payment as late
    const result = chain.callPublic(
        "payment-automation",
        "mark-payment-late",
        [
          types.uint(1), // payment-id
        ],
        owner.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
})

