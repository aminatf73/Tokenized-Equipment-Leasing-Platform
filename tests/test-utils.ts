// Simple mock implementation of Clarinet test utilities
// In a real project, you would use the actual Clarinet libraries

export class Account {
	address: string
	
	constructor(name: string) {
		this.address = `ST1${name}`.padEnd(40, "0")
	}
}

export class Chain {
	accounts: Map<string, Account> = new Map()
	height = 1
	
	createAccount(name: string): Account {
		const account = new Account(name)
		this.accounts.set(name, account)
		return account
	}
	
	callPublic(contract: string, method: string, args: any[], sender: string) {
		// This is a mock implementation that would normally interact with Clarinet
		// For testing purposes, we'll return predefined responses based on the inputs
		
		if (contract === "asset-registration" && method === "register-asset") {
			return {
				success: true,
				value: types.ok(types.uint(1)),
			}
		}
		
		// Add more mock responses as needed for your tests
		
		return {
			success: true,
			value: types.ok(types.bool(true)),
		}
	}
	
	mineEmptyBlock(count = 1) {
		this.height += count
	}
}

export const types = {
	uint: (value: number) => ({ type: "uint", value }),
	int: (value: number) => ({ type: "int", value }),
	bool: (value: boolean) => ({ type: "bool", value }),
	principal: (value: string) => ({ type: "principal", value }),
	ascii: (value: string) => ({ type: "string-ascii", value }),
	utf8: (value: string) => ({ type: "string-utf8", value }),
	buffer: (value: string) => ({ type: "buffer", value }),
	some: (value: any) => ({ type: "optional", value }),
	none: { type: "optional", value: null },
	ok: (value: any) => ({ type: "response", value, success: true }),
	err: (value: any) => ({ type: "response", value, success: false }),
}

export const Clarinet = {
	// Mock Clarinet object if needed
}

