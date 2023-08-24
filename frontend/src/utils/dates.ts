const zeroPad = (num: number, pad: number) => {
	return String(num).padStart(pad, '0')
}

const isSameDay = (d1: Date, d2: Date) => {
	console.log(`${typeof(d1)} is same to ${typeof(d2)}`);
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	)
}

export const parseTimestamp = (timestamp: Date, format = '') => {
	if (!timestamp) return

	const date = timestamp.getSeconds()
		? new Date(timestamp.getSeconds() * 1000)
		: timestamp

	if (format === 'HH:mm') {
		return `${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`
	} else if (format === 'DD MMMM YYYY') {
		return `${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', day: 'numeric' }).format(date)}`
	} else if (format === 'DD/MM/YY') {
		return `${new Intl.DateTimeFormat('en-GB', { month: 'numeric', year: 'numeric', day: 'numeric' }).format(date)}`
	} else if (format === 'DD MMMM, HH:mm') {
		return `${new Intl.DateTimeFormat('en-GB', { month: 'long', day: 'numeric' }).format(
			date
		)}, ${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`
	}
	return date
}

export const formatTimestamp = (date: Date, timestamp: Date) => {
	const timestampFormat = isSameDay(date, new Date()) ? 'HH:mm' : 'DD/MM/YY'
	const result = parseTimestamp(timestamp, timestampFormat)
	return timestampFormat === 'HH:mm' ? `Today, ${result}` : result
}