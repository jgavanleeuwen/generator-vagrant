'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var process = require('child_process');


var VagrantGenerator = yeoman.generators.Base.extend({

  provideBoxes: function () {
    var done = this.async();

    this.boxList = [];
    process.exec('vagrant box list', function (error, stdout, stderr) {
      this.boxList = stdout.split(/\r?\n/).filter(function(n){ return n });
      this.boxList.push("Other");
      done();
    }.bind(this));
  },

  provideRoles: function() {
    var done = this.async();

    this.roleList = [];
    process.exec('knife role list', function (error, stdout, stderr) {
      this.roleList = stdout.split(/\r?\n/).filter(function(n){ return n });
      done();
    }.bind(this));
  },

  provideEnvironments: function() {
    var done = this.async();

    this.environmentList = [];
    process.exec('knife environment list', function (error, stdout, stderr) {
      this.environmentList = stdout.split(/\r?\n/).filter(function(n){ return n });
      done();
    }.bind(this));
  },
  
  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Vagrant generator!'));

    var prompts = [{
      type: 'list',
      name: 'boxName',
      message: 'Which Vagrant Box would you like to use?',
      choices: this.boxList,
      filter: function(input) {
        return input.replace(/\((.*?)\)/g, '').trim();
      }
    }, {
      type: 'input',
      name: 'newBoxName',
      message: 'What would you like to be your new Box name?',
      when: function(props) {
        return props.boxName === 'Other'?true:false;
      },
      validate: function(input) {
        return (input.length > 0);
      }
    }, {
      type: 'input',
      name: 'newBoxUrl',
      message: 'What is the URL of your new Vagrant Box?',
      when: function(props) {
        return props.boxName === 'Other'?true:false;
      },
      validate: function(input) {
        return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(input);
      }
    }, {
      type: 'input',
      name: 'hostName',
      message: 'What would you like to be the Vagrant Hostname?',
      validate: function(input) {
        return (input.length > 0);
      }
    }, {
      type: 'input',
      name: 'hostPort',
      message: 'What port would you like to forward to the guest?',
      default: 8080,
      validate: function(input) {
        return !isNaN(input) && parseInt(Number(input)) == input;
      }
    }, {
      type: 'checkbox',
      name: 'knifeRoles',
      message: 'Which Knife Role would you like to apply?',
      choices: this.roleList
    }, {
      type: 'list',
      name: 'knifeEnvironment',
      message: 'Which Knife Environment would you like to apply?',
      choices: this.environmentList
    }, {
      type: 'input',
      name: 'organisationName',
      message: 'What is the name of your organisation registered by Chef?',
      validate: function(input) {
        return (input.length > 0);
      }
    }, {
      type: 'input',
      name: 'serverUrl',
      message: 'What is the URL of your Chef server?',
      default: function(props) {
        return "https://api.opscode.com/organizations/" + props.organisationName;
      }
    }, {
      type: 'input',
      name: 'validationClientName',
      message: 'What is the name of your client-validator?',
      default: function(props) {
        return props.organisationName + "-validator";
      }
    }, {
      type: 'input',
      name: 'validationKeyPath',
      message: 'What is the location of your key?',
      default: function(props) {
        return "~/.chef/" + props.validationClientName + ".pem"
      }
    }];

    this.prompt(prompts, function (props) {
      this.boxName = props.boxName;
      this.newBoxName = props.newBoxName;
      this.newBoxUrl = props.newBoxUrl;
      this.hostName = props.hostName;
      this.hostPort = props.hostPort;
      this.knifeRoles = props.knifeRoles;
      this.knifeEnvironment = props.knifeEnvironment;
      this.organisationName = props.organisationName;
      this.validationClientName = props.validationClientName;
      this.validationKeyPath = props.validationKeyPath;
      this.serverUrl = props.serverUrl;

      done();
    }.bind(this));
  },

  templateFile: function () {
    this.template("_Vagrantfile", "VagrantFile", this);
  },

  forward: function () {
    this.log(yosay('Your Vagrantfile has been created. Run `vagrant up` to start the guest-machine. After the first run, uncomment the [Landrush] settings and use the --provision tag to enable Landrush.'));
  }
});

module.exports = VagrantGenerator;
