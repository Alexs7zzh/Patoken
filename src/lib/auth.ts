import createPersistentStore from '$utils/createPersistentStore'

let magic

async function createMagic() {
	if (magic) return magic
	else {
		const Magic = (await import('magic-sdk')).default.Magic
		magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC_KEY as string)
		return magic
	}
}

export const userStore = createPersistentStore('user', null)
// writable<null|{email: string, name: string|null}>(null)

export async function login(email: string): Promise<{ email: string; name: null | string }> {
	const magic = createMagic()
	//@ts-ignore
	const didToken = await magic.auth.loginWithMagicLink({ email })

	const res = await fetch('/api/login', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${didToken}`
		}
	})

	if (res.ok) {
		const data = await res.json()
		userStore.set(data)
		return data
	}
}
