import React from 'react';
var ShopForItem = require('./ShopForItem');

var ShopForList = React.createClass({

	getItems() {
  		var result = [];
  		var items = this.props.items;
  		for(var index in items) {
  			result.push(<ShopForItem draggable={this.props.draggable} key={index} item={items[index]} />);
  		}

      if(result.length === 0){
        return (<p>Empty list</p>);
      }

  		return result;
  },

  render() {
    var listClassNames = " wrapper";
    return (
      <ul className={listClassNames}>
      	{this.getItems()}
      </ul>
    );
  }

});

module.exports = ShopForList;
