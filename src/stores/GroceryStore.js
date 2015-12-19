var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var ConfigConstants = require('../constants/ConfigConstants');
var assign = require('object-assign');
var Firebase = require('firebase');
var CHANGE_EVENT = 'change';

var _groceriesList = {};
var _mealCalendarItems = {};

function create(text) {
  var ref = new Firebase(ConfigConstants.Firebase_Root_Url + "groceries");
  ref.on("child_added", function(snapshot) {
      if(! _groceriesList[snapshot.key()]) {
        _groceriesList[snapshot.key()] = {
          id: snapshot.key(),
          isInPantry: false,
          isInRecipeFinder:false,
          text: text
        }; 
      }    
  });
  ref.off();
}

function scheduleMeal(text,mealType,plannedFor) {
  var ref = new Firebase(ConfigConstants.Firebase_Root_Url + "mealcalendar");
  ref.on("child_added", function(snapshot) {

    if(! _mealCalendarItems[snapshot.key()]) {
      _mealCalendarItems[snapshot.key()] = {
        id: snapshot.key(),
        planned_for:plannedFor,
        mealType:"item",
        text: text
      };

    }    
  });
  ref.off();
}

function update(id, updates) {
  _groceriesList[id] = assign({}, _groceriesList[id], updates);
}

function updateAll(updates) {
  for (var id in _groceriesList) {
    update(id, updates);
  }
}

function find(id){
  return _groceriesList[id];
}

function destroy(id) {
  delete _groceriesList[id];
}

var GroceryStore = assign({}, EventEmitter.prototype, {

  setAll(groceryList) {
    _groceriesList = groceryList;

  },

  getAll() {
    return _groceriesList;
  },

  getAllMealItems(){
    return _mealCalendarItems;
  },

  setAllMealItems(mealCalendarItems) {
    _mealCalendarItems = mealCalendarItems;
  },

  find(id){
      return find(id);
  },

  update(id,updates){
    return update(id,updates);
  },

  getIncompleteList() {
    var incompleteList = [];
    for(var itemId in _groceriesList) {

      if(! _groceriesList[itemId].isInPantry) 
      {
        incompleteList[itemId] = groceries[itemId]; 
      }
    }
    return incompleteList;
  },

  /* Filter groceries to items with isInPantry set to true */
  getPantryList(){
      var pantryList = {};
      for(var itemId in _groceriesList) {

        if(_groceriesList[itemId].isInPantry) 
        {
          pantryList[itemId] = _groceriesList[itemId]; 
        }
      }
      return pantryList;
  },

  /* Filter groceries to items with isInPantry set to false */
   getShoppingList(){
      var shoppingList = {};
      for(var itemId in _groceriesList) {

        if(! _groceriesList[itemId].isInPantry) 
        {
          shoppingList[itemId] = _groceriesList[itemId];
        }
      }
      return shoppingList;
  },

  /* Filter groceries to items with isInRecipeFinder set to true */
  getItemsInRecipeFinder(){
      var itemInRecipeFinder = {};
      for(var itemId in _groceriesList) {

        if(_groceriesList[itemId].isInRecipeFinder) 
        {
          itemInRecipeFinder[itemId] = _groceriesList[itemId];          
        }
      }
      return itemInRecipeFinder;    
  },

  getCompleteList() {
    var completeList = [];
    for(var itemId in _groceriesList) {

      if(_groceriesList[itemId].isInPantry)
      {
        completeList[itemId] = _groceriesList[itemId];
      }
    }
    return completeList;
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
  var text;

  switch(action.actionType) {
    case AppConstants.SHOP_FOR_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text);
        GroceryStore.emitChange();
      }
      break;

    case AppConstants.SHOP_FOR_UNDO_COMPLETE:
      update(action.id, {isInPantry: false});
      GroceryStore.emitChange();
      break;

    case AppConstants.SHOP_FOR_COMPLETE:
      update(action.id, {isInPantry: true});
      GroceryStore.emitChange();
      break;

    case AppConstants.SHOP_FOR_UPDATE_TEXT:
      text = action.text.trim();
      if (text !== '') {
        update(action.id, {text: text});
        GroceryStore.emitChange();
      }
      break;

    case AppConstants.SHOP_FOR_DESTROY:
      destroy(action.id);
      GroceryStore.emitChange();
      break;

    case AppConstants.RECIPE_FINDER_ITEM_DROP:
      update(action.id, {isInRecipeFinder:true});
      GroceryStore.emitChange();
      break;

    case AppConstants.SCHEDULE_MEAL:
      scheduleMeal(action.itemText,action.mealType,action.planned_for);
      GroceryStore.emitChange();
      break;

    case AppConstants.UNSET_ALL_ITEMS_IN_RECIPE_FINDER:
     // @todo only update items that have isInRecipeFinder set to true (better perf.)
      updateAll({isInRecipeFinder:false});
      GroceryStore.emitChange();
      break;
      
    default:    
  }
});

module.exports = GroceryStore;