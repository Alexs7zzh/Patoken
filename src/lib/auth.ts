import createPersistentStore from '$utils/createPersistentStore'
import type { Magic } from 'magic-sdk'

let magic

async function createMagic(): Promise<Magic> {
	if (magic) return magic
	else {
		const Magic = (await import('magic-sdk')).Magic
		magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC_KEY as string)
		return magic
	}
}

export const userStore = createPersistentStore('user', null)

export async function login(email: string): Promise<{ email: string; name: null | string }> {
	const magic = await createMagic()
	const didToken = await magic.auth.loginWithMagicLink({ email })

	const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
		method: 'POST',
		credentials: 'include',
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
