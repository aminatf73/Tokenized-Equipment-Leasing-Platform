import { describe, it, expect, beforeEach } from "vitest"
import { Chain, type Account, types } from "./test-utils"

describe("asset-registration contract", () => {
  let chain: Chain
  let deployer: Account
  let user1: Account
  let user2: Account
  
  beforeEach(() => {
    chain = new Chain()
    deployer = chain.createAccount("deployer")
    user1 = chain.createAccount("user1")
    user2 = chain.createAccount("user2")
  })
  
  it("allows users to register assets", () => {
    const result = chain.callPublic(
        "asset-registration",
        "register-asset",
        [
          types.ascii("Excavator XL200"),
          types.ascii("Heavy duty excavator for construction"),
          types.uint(20230101),
          types.uint(50000),
        ],
        user1.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.uint(1)))
  })
  
  it("allows asset owners to update asset status", () => {
    // First register an asset
    chain.callPublic(
        "asset-registration",
        "register-asset",
        [types.ascii("Forklift F100"), types.ascii("Industrial forklift"), types.uint(20230201), types.uint(30000)],
        user1.address,
    )
    
    // Then update its status
    const result = chain.callPublic(
        "asset-registration",
        "update-asset-status",
        [types.uint(1), types.ascii("maintenance"), types.bool(false)],
        user1.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
  })
  
  it("allows asset owners to transfer ownership", () => {
    // First register an asset as user1
    chain.callPublic(
        "asset-registration",
        "register-asset",
        [
          types.ascii("Crane C300"),
          types.ascii("Tower crane for construction"),
          types.uint(20230401),
          types.uint(100000),
        ],
        user1.address,
    )
    
    // Then transfer ownership to user2
    const result = chain.callPublic(
        "asset-registration",
        "transfer-asset",
        [types.uint(1), types.principal(user2.address)],
        user1.address,
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toEqual(types.ok(types.bool(true)))
    
    // Verify user2 can now update the asset
    const updateResult = chain.callPublic(
        "asset-registration",
        "update-asset-status",
        [types.uint(1), types.ascii("active"), types.bool(true)],
        user2.address,
    )
    
    expect(updateResult.success).toBe(true)
  })
})

