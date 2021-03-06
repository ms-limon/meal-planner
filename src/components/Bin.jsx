import React from 'react';
var GroceryStore = require('../stores/GroceryStore');
var RecipeFinderItem = require('./RecipeFinderItem');

var Bin = React.createClass({
  
    getItems(){
      var renderItems = [];
      var items = this.props.items;
      for(var index in items) {
        renderItems.push(
          <RecipeFinderItem key={index} item={items[index]} />
        );
      }
      
      return renderItems;
    },

  	_onDragOver(e){
  		if (e.preventDefault) e.preventDefault(); 
    	e.dataTransfer.dropEffect = 'copy';

    	return false;
  	},

  	_onDrop(e) {
  		if (e.stopPropagation) e.stopPropagation();
      var droppedItem = GroceryStore.find(e.dataTransfer.getData('item'));
      this.props.onDrop(droppedItem);

	    return false;
  	},

    _findRecipes(e) {
      e.preventDefault();
      this.props.onRecipeFinderSubmit();
    },

    getFindRecipesBtn() {
      if(this.props.isShowSubmitBtn){
        return (<button className="btn btn-primary" onClick={this._findRecipes}>{this.props.btnText}</button>);
      } else {
        return '';
      }
    },

    getListHeading(){
      if(this.props.isShowSubmitBtn){
        return (<h4>Ingredients</h4>);
      } else {
        return '';
      }
    },

  render() {

    return (
      <section onDrop={this._onDrop} onDragOver={this._onDragOver}>
      	<h3>{this.props.title}</h3>
        <div className="well well-sm">Drag and drop items from pantry here</div>
        <div className="clearfix"></div> 
        {this.getListHeading()}    
        <ul className="col-md-10 list-group">
          {this.getItems()}
        </ul>
        <div className="clearfix"></div>      
        <p>
          {this.getFindRecipesBtn()}
        </p>
      </section>
    );
  }

});

module.exports = Bin;