/**
 * Update the stored informations about a building
 *
 * @param {Integer} building
 * @param {Array}   informations
 */
CookieMonster.setBuildingInformations = function (building, informations) {
	this.bottomBar.items[building]    = informations.items;
	this.bottomBar.bonus[building]    = informations.bonus;
	this.bottomBar.cpi[building]      = informations.cpi;
	this.bottomBar.timeLeft[building] = informations.timeLeft;
};

//////////////////////////////////////////////////////////////////////
///////////////////////////// DOM MODIFIERS //////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Create the Bottom Bar
 *
 * @return {void}
 */
CookieMonster.createBottomBar = function() {
	$('body').append('<div id="cookie_monster_bar"></div>');

	this.$monsterBar = $('#cookie_monster_bar').css({
		'background-color' : '#4D4548',
		'background-image' : 'linear-gradient(to bottom, #4d4548, #000000)',
		'border-top'       : '1px solid black',
		'bottom'           : '0px',
		'cursor'           : 'default',
		'height'           : '56px',
		'left'             : '0px',
		'position'         : 'absolute',
		'text-shadow'      : '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
		'width'            : '100%',
		'z-index'          : '1000',
	});
};

/**
 * Toggle the visibility of the Bottom Bar
 *
 * @return {void}
 */
CookieMonster.toggleBar = function() {
	var toggle = this.getBooleanSetting('CMBar');
	var bottom = !toggle ? 0 : 57;

	this.$monsterBar.toggle(toggle);
	this.$game.css('bottom', bottom+'px');
};

/**
 * Create the Bottom Bar
 *
 * @return {void}
 */
CookieMonster.makeTable = function() {
	var thead    = '<th align="left"  style="color:#' + this.colors.yellow + ';" width=130> ' + this.version + "</th>";
	var bonus    = '<th align="right" style="color:#' + this.colors.blue   + ';">Bonus Income</th>';
	var baseCost = '<th align="right" style="color:#' + this.colors.blue   + ';">Base Cost Per Income</th>';
	var timeLeft = '<th align="right" style="color:#' + this.colors.blue   + ';">Time Left</th>';

	// Append each building type to the bar
	Game.ObjectsById.forEach(function (building, key) {
		thead    += '<th align="middle" id="cookie_monster_item_' +key+ '" style="font-weight:bold;"></th>';
		bonus    += '<td align="middle" id="cookie_monster_is_'   +key+ '"></td>';
		baseCost += '<td align="middle" id="cookie_monster_cpi_'  +key+ '"></td>';
		timeLeft += '<td align="middle" id="cookie_monster_tc_'   +key+ '"></td>';
	});

	this.$monsterBar.html(
		'<table style="width:100%; table-layout:fixed; margin-top:2px;">'+
			'<tr>'+thead+'</tr>'+
			'<tr>'+bonus+'</tr>'+
			'<tr>'+baseCost+'</tr>'+
			'<tr>'+timeLeft+'</tr>'+
		'</table>');
};

/**
 * Update the contents of the Bottom Bar
 *
 * @return {void}
 */
CookieMonster.updateTable = function() {
	var that = this;

	// Here we loop over the information we have, and building a multidimensionnal
	// array of it, by building key
	Game.ObjectsById.forEach(function (building, key) {
		var price = building.price;
		var owned = building.amount;
		var s = building.storedCps * Game.globalCpsMult;
		if (building.name === "Grandma") {
			s = 0;
		}

		// Compute informations
		var bonus = that.roundDecimal(s + that.getUpgradeBonuses(building.name, owned, s));
		var cpi   = that.roundDecimal(price / bonus);
		var count = '(<span style="color: #' +that.colors.blue+ ';">' + that.formatNumber(owned) + '</span>)';

		that.setBuildingInformations(key, {
			items    : building.name.split(' ')[0] + ' ' + count,
			bonus    : that.roundDecimal(bonus),
			cpi      : that.roundDecimal(cpi),
			timeLeft : Math.round(that.secondsLeft(key, "object")),
		});
	});

	// Then we loop over the created array, format the information
	// and update the DOM
	Game.ObjectsById.forEach(function (building, key) {
		var colors       = [that.colors.yellow, that.colors.yellow];
		var informations = [that.bottomBar.cpi[key], that.bottomBar.timeLeft[key]];
		var worst        = [Math.max.apply(Math, that.bottomBar.cpi), Math.max.apply(Math, that.bottomBar.timeLeft)];
		var best         = [Math.min.apply(Math, that.bottomBar.cpi), Math.min.apply(Math, that.bottomBar.timeLeft)];

		// Compute correct colors
		for (var i = 0; i < colors.length; i++) {
			if (informations[i] === best[i]) {
				colors[i] = that.colors.green;
			} else if (informations[i] === worst[i]) {
				colors[i] = that.colors.red;
			} else if (worst[i] - informations[i] < informations[i] - best[i]) {
				colors[i] = that.colors.orange;
			}
		}

		// Update DOM
		$('#cookie_monster_item_' + key).html(that.bottomBar.items[key]);
		$('#cookie_monster_is_'   + key).html(that.formatNumber(that.bottomBar.bonus[key]));
		$('#cookie_monster_cpi_'  + key).html('<span style="color:#' + colors[0] + ';">' + that.formatNumber(informations[0]) + '</span>');
		$('#cookie_monster_tc_'   + key).html('<span style="color:#' + colors[1] + ';">' + that.formatTime(informations[1], 'min') + '</span>');
	});
};