/**
* Helper functions to get the month as a string instead of a number
*/

Date.monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];
Date.monthNamesAbbrev = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

Date.prototype.getMonthName = function() {
	return Date.monthNames[ this.getMonth() ];
}

Date.prototype.getMonthNameAbbrev = function() {
	return Date.monthNamesAbbrev[ this.getMonth() ];
}
Date.prototype.getUTCMonthName = function() {
	return Date.monthNames[ this.getUTCMonth() ];
}

Date.prototype.getUTCMonthNameAbbrev = function() {
	return Date.monthNamesAbbrev[ this.getUTCMonth() ];
}

