import approxSearch from 'approx-string-match'
import type { Match as StringMatch } from 'approx-string-match'

interface Match {
	start: number
	end: number
	score: number
}

function search(text: string, str: string, maxErrors: number) {
	// Do a fast search for exact matches. The `approx-string-match` library
	// doesn't currently incorporate this optimization itself.
	let matchPos = 0
	let exactMatches = []
	while (matchPos !== -1) {
		matchPos = text.indexOf(str, matchPos)
		if (matchPos !== -1) {
			exactMatches.push({
				start: matchPos,
				end: matchPos + str.length,
				errors: 0
			})
			matchPos += 1
		}
	}
	if (exactMatches.length > 0) {
		return exactMatches
	}

	// If there are no exact matches, do a more expensive search for matches
	// with errors.
	return approxSearch(text, str, maxErrors)
}

function textMatchScore(text: string, str: string) {
	// `search` will return no matches if either the text or pattern is empty,
	// otherwise it will return at least one match if the max allowed error count
	// is at least `str.length`.
	if (str.length === 0 || text.length === 0) {
		return 0.0
	}

	const matches = search(text, str, str.length)

	// prettier-ignore
	return 1 - (matches[0].errors / str.length);
}

interface Context {
	prefix?: string
	suffix?: string
}

export function matchQuote(text: string, quote: string, context: Context = {}): Match | null {
	if (quote.length === 0) {
		return null
	}

	// Choose the maximum number of errors to allow for the initial search.
	// This choice involves a tradeoff between:
	//
	//  - Recall (proportion of "good" matches found)
	//  - Precision (proportion of matches found which are "good")
	//  - Cost of the initial search and of processing the candidate matches [1]
	//
	// [1] Specifically, the expected-time complexity of the initial search is
	//     `O((maxErrors / 32) * text.length)`. See `approx-string-match` docs.
	const maxErrors = Math.min(256, quote.length / 2)

	// Find closest matches for `quote` in `text` based on edit distance.
	const matches = search(text, quote, maxErrors)

	if (matches.length === 0) {
		return null
	}

	const scoreMatch = (match: StringMatch) => {
		const quoteWeight = 50 // Similarity of matched text to quote.
		const prefixWeight = 20 // Similarity of text before matched text to `context.prefix`.
		const suffixWeight = 20 // Similarity of text after matched text to `context.suffix`.
		const posWeight = 2 // Proximity to expected location. Used as a tie-breaker.

		const quoteScore = 1 - match.errors / quote.length

		const prefixScore = context.prefix
			? textMatchScore(text.slice(Math.max(0, match.start - context.prefix.length), match.start), context.prefix)
			: 1.0
		const suffixScore = context.suffix
			? textMatchScore(text.slice(match.end, match.end + context.suffix.length), context.suffix)
			: 1.0

		let posScore = 1.0

		const rawScore =
			quoteWeight * quoteScore + prefixWeight * prefixScore + suffixWeight * suffixScore + posWeight * posScore
		const maxScore = quoteWeight + prefixWeight + suffixWeight + posWeight
		const normalizedScore = rawScore / maxScore

		return normalizedScore
	}

	// Rank matches based on similarity of actual and expected surrounding text
	// and actual/expected offset in the document text.
	const scoredMatches = matches.map(m => ({
		start: m.start,
		end: m.end,
		score: scoreMatch(m)
	}))

	// Choose match with highest score.
	scoredMatches.sort((a, b) => b.score - a.score)
	return scoredMatches[0]
}
