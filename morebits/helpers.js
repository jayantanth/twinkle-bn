// Simple helper functions to see what groups a user might belong

function userIsInGroup( group ) {

	return ( wgUserGroups != null && wgUserGroups.indexOf( group ) != -1 ) || ( wgUserGroups == null && group == 'anon' );
}

function userIsAnon() {
	return wgUserGroups == null;
}

// AOL Proxy IP Addresses (2007-02-03)
var AOLNetworks = [
	'64.12.96.0/19',
	'149.174.160.0/20',
	'152.163.240.0/21',
	'152.163.248.0/22',
	'152.163.252.0/23',
	'152.163.96.0/22',
	'152.163.100.0/23',
	'195.93.32.0/22',
	'195.93.48.0/22',
	'195.93.64.0/19',
	'195.93.96.0/19',
	'195.93.16.0/20',
	'198.81.0.0/22',
	'198.81.16.0/20',
	'198.81.8.0/23',
	'202.67.64.128/25',
	'205.188.192.0/20',
	'205.188.208.0/23',
	'205.188.112.0/20',
	'205.188.146.144/30',
	'207.200.112.0/21',
];

// AOL Client IP Addresses (2007-02-03)
var AOLClients = [
	'172.128.0.0/10',
	'172.192.0.0/12',
	'172.208.0.0/14',
	'202.67.66.0/23',
	'172.200.0.0/15',
	'172.202.0.0/15',
	'172.212.0.0/14',
	'172.216.0.0/16',
	'202.67.68.0/22',
	'202.67.72.0/21',
	'202.67.80.0/20',
	'202.67.96.0/19',
];

/**
* ipadress is in the format 1.2.3.4 and network is in the format 1.2.3.4/5
*/

function isInNetwork( ipaddress, network ) {
	var iparr = ipaddress.split('.');
	var ip = (parseInt(iparr[0]) << 24) + (parseInt(iparr[1]) << 16) + (parseInt(iparr[2]) << 8) + (parseInt(iparr[3]));

	var netmask = 0xffffffff << network.split('/')[1];

	var netarr = network.split('/')[0].split('.');
	var net = (parseInt(netarr[0]) << 24) + (parseInt(netarr[1]) << 16) + (parseInt(netarr[2]) << 8) + (parseInt(netarr[3]));

	return (ip & netmask) == net;
}

/* Returns true if given string contains a valid IP-address, that is, from 0.0.0.0 to 255.255.255.255*/
function isIPAddress( string ){
	var res = /(\d{1,4})\.(\d{1,3})\.(\d{1,3})\.(\d{1,4})/.exec( string );
	return res != null && res.slice( 1, 5 ).every( function( e ) { return e < 256; } );
}

