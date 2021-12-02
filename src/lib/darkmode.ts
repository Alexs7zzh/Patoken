const darkModeStorageKey = 'user-color-scheme'

const getMediaQueryMode = () =>
	window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyDarkModeSettings = (mode = undefined) => {
	const rootElement = document.documentElement
	const darkModeAttributeName = 'data-user-color-scheme'
	const colorSchemeMetaElement = document.getElementById('color-scheme')

	let currentSetting = mode || localStorage.getItem(darkModeStorageKey)
	const mediaQueryMode = getMediaQueryMode()

	if (currentSetting && currentSetting !== mediaQueryMode) {
		rootElement.setAttribute(darkModeAttributeName, currentSetting)
		colorSchemeMetaElement.setAttribute('content', currentSetting)
	} else {
		rootElement.removeAttribute(darkModeAttributeName)
		localStorage.removeItem(darkModeStorageKey)
		colorSchemeMetaElement.setAttribute('content', 'dark light')
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
