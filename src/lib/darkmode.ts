const rootElement = typeof window !== 'undefined' && document.documentElement
const darkModeAttributeName = 'data-user-color-scheme'
const darkModeStorageKey = 'user-color-scheme'
const colorSchemeMetaElement = typeof window !== 'undefined' && document.getElementById('color-scheme')

const getMediaQueryMode = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const resetRootDarkModeAttributeAndLS = () => {
	rootElement.removeAttribute(darkModeAttributeName)
	localStorage.removeItem(darkModeStorageKey)
	colorSchemeMetaElement.setAttribute('content', 'dark light')
}

export const applyDarkModeSettings = (mode = undefined) => {
	if (typeof window === 'undefined') return
	let currentSetting = mode || localStorage.getItem(darkModeStorageKey)
	const mediaQueryMode = getMediaQueryMode()

	if (currentSetting && currentSetting !== mediaQueryMode) {
		rootElement.setAttribute(darkModeAttributeName, currentSetting)
		colorSchemeMetaElement.setAttribute('content', currentSetting)
	} else {
		resetRootDarkModeAttributeAndLS()
		currentSetting = mediaQueryMode
	}
	document.getElementById('theme-color').setAttribute('content', currentSetting === 'dark' ? '#212020' : '#fafafa')
}

export const toggleDarkMode = () => {
	const invertMode = mode => (mode === 'dark' ? 'light' : 'dark')

	let currentSetting = localStorage.getItem(darkModeStorageKey)

	if (currentSetting === null) currentSetting = invertMode(getMediaQueryMode())
	else currentSetting = invertMode(currentSetting)

	localStorage.setItem(darkModeStorageKey, currentSetting)

	applyDarkModeSettings(currentSetting)
}
