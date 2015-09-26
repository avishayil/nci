'use strict';

define([
	'underscore',
	'reflux', 'app/actions/project', 'app/resources'
], function(_, Reflux, ProjectActions, resources) {
	var resource = resources.projects;

	var Store = Reflux.createStore({
		listenables: ProjectActions,
		project: null,

		onChange: function(project, action) {
			this.trigger(project);
		},

		init: function() {
			resource.subscribe('change', this.onChange);
		},

		onRead: function(params) {
			var self = this;
			resource.sync('read', params, function(err, project) {
				if (err) throw err;
				self.project = project;
				self.trigger(self.project);
			});
		}
	});

	return Store;
});
