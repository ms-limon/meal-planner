var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var ConfigConstants = require('../constants/ConfigConstants');
var assign = require('object-assign');
var Firebase = require('firebase');
var CHANGE_EVENT = 'change';

var _recipeList = {};

function find(id){
  return _recipeList[id];
}

var RecipeStore = assign({}, EventEmitter.prototype, {

  find(id) {
      return find(id);
  },

  setAll(recipeList) {
    _recipeList = recipeList;
  },

  emitChange() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case AppConstants.FIND_RECIPE:
      if (action.id.trim() !== '') {
        find(action.id);
        RecipeStore.emitChange();
      }
      break;
      
    default:    
  }
});

module.exports = RecipeStore;