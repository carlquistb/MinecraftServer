module.exports = PlayerWatcher;

function PlayerWatcher(shutdownFunc) {
	this._loggedInPlayers = [];
	this._shutdownFunc = shutdownFunc;
	this._updateInterval();
}

PlayerWatcher.prototype.registerWithStreamWatcher = function (streamWatcher) {
	streamWatcher.addWatcher(
		/^\[\d\d:\d\d:\d\d\][\w[\]/ ]*?: (\S+) joined the game/,
		(stdin, regexData) => this._addPlayer(stdin, regexData)
	);
	streamWatcher.addWatcher(
		/^\[\d\d:\d\d:\d\d\][\w[\]/ ]*?: (\S+) left the game/,
		(stdin, regexData) => this._removePlayer(stdin, regexData)
	);
};

PlayerWatcher.prototype._attemptShutdown = function () {
	if (this._loggedInPlayers.length === 0) {
		this._shutdownFunc.call();
	} else {
		this._updateInterval();
	}
};

PlayerWatcher.prototype._addPlayer = function (stdin, regexData) {
	this._loggedInPlayers.push(regexData[1]);
	this._updateInterval();
};

PlayerWatcher.prototype._removePlayer = function (stdin, regexData) {
	const playerIndex = this._loggedInPlayers.indexOf(regexData[1]);
	if (playerIndex > -1) {
		this._loggedInPlayers.splice(playerIndex, 1);
	}
	this._updateInterval();
};

PlayerWatcher.prototype._updateInterval = function () {
	if (this._shutdownInterval) {
		clearInterval(this._shutdownInterval);
	}
	this._shutdownInterval = setInterval(
		() => this._attemptShutdown(),
		1000 * 60 * 15
	);
};
