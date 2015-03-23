'use strict';

var Steppy = require('twostep').Steppy,
	inherits = require('util').inherits,
	ParentExecutor = require('./base').Executor,
	createScm = require('../scm').createScm,
	createCommand = require('../command').createCommand,
	fs = require('fs');

function Executor(params) {
	ParentExecutor.call(this, params);
}

inherits(Executor, ParentExecutor);

exports.Executor = Executor;

Executor.prototype._getSources = function(params, callback) {
	var self = this,
		scm, isFirstRun;
	Steppy(
		function() {
			var slot = this.slot();
			fs.exists(self.cwd, function(exists) {
				slot(null, exists);
			});
		},
		function(err, exists) {
			var scmParams = {type: params.type};
			if (exists) {
				scmParams.cwd = self.cwd;
				isFirstRun = false;
			} else {
				scmParams.repository = params.repository;
				isFirstRun = true;
			}
			scm = createScm(scmParams);
			if (isFirstRun) {
				scm.clone(self.cwd, params.rev, this.slot());
			} else {
				scm.pull(params.rev, this.slot())
			}
		},
		function() {
			if (!isFirstRun) {
				scm.update(params.rev, this.slot());
			} else {
				this.pass(null);
			}
		},
		callback
	);
};

Executor.prototype._runStep = function(params, callback) {
	Steppy(
		function() {
			if (params.type !== 'shell') {
				throw new Error('Unknown step type: ' + params.type);
			}
			var command = createCommand(params);
			command.run(params, this.slot())
		},
		callback
	);
};
