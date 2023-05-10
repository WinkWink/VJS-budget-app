// module pattern IIFE that will return an obj
/*(Immediately Invoked Function Expression)
it runs as soon as it is defined, self executing anonymous function
in javascript objects are king , if you understand objects, you understand JS
A JavaScript object is a collection of named values
the named values in objects are called properties 
methods are actions that can be performed on objects 
we create modules because we want to keep pieces of code that are related to each other together
separate independent units
the modules can have variables and functions that are private to that module , only accessible to module
if public, other functions and modules can access and use - data encapsulation 
data encapsulation allows us to hide the implementation details of a specific module from the outside scope
so we only expose a public interface, which is sometimes called an API 
module pattern uses closures and IIFEs
IIFE scope cannot be accessed from outside
module pattern returns an object containing all of the functions we want to be public 
(the functions we want to give the outside access to)
anything in return is accessible to the outside scope 
this works because of closures
what is not in the return {} is in the closure 
*/
 
// the budget module and ui controller module are independent from each other, they are stand alone 
// user interface is separated from the data, this is called separation of concerns 

var budgetController = (function(){
 	
	// expense object contructor 
	/*
	in an object method, this refers to the global object 
	it is good practice to start constructor with capital 
	in constructor function this does not have a value it is a sub for the new object
	the value of this will become the new object when a new obj is created 
	*/ 
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	// The JavaScript prototype property allows you to add new properties to object constructors
	// The JavaScript prototype property also allows you to add new methods to objects constructors

	Expense.prototype.calcPercentage = function(totalIncome){
		if (totalIncome > 0) {
		this.percentage = Math.round((this.value / totalIncome) * 100);	
		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}

	// income constructor
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	// global data structure | data object | data model 
	var data = {
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget: 0,
		percentage: -1
	};

// how we create the objects with the constructor above 
	return {
		// addItem: set up like this is a method 
		addItem: function(type, des, value){
			var newItem, ID;

			//create id for a new item
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}else{
				ID = 0;
			}
			
			// create new item based on income or expense 
			if (type === 'exp'){
				newItem = new Expense(ID, des, value);
			} else if (type === 'inc'){
				newItem = new Income(ID, des, value);

			}

			// push it to our data structure and return the new element
			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id){
			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}		
		},

		calculateBudget: function(){
			// calculate total income and expenses 
			calculateTotal('exp');
			calculateTotal('inc');
			// calculate the budget income - expenses 
			data.budget = data.totals.inc - data.totals.exp;
			// calc the percentage of income that we spent 
			if (data.totals.inc > 0) {
				data.percentage =  Math.round((data.totals.exp / data.totals.inc) * 100);
			}else{
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function(){
			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function(){
			console.log(data);
		}
	}

})();
// the parens at the end invoke the anonymous function 

var UIController = (function(){
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		expenseContainer: '.expenses__list',
		incomeContainer: '.income__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type){
			var numSplit, int, dec;
			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');
			int = numSplit[0];

			if (int.length  > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
			}

			dec = numSplit[1];

			return (type === 'exp' ? "-" : "+") + ' ' + int + '.' +dec;;

		};

	var nodeListForEach = function(list, callback){
				for(var i = 0; i < list.length; i++){
					callback(list[i], i);
				}
			};

	return {
		getinput: function(){
			return {
			type: document.querySelector(DOMstrings.inputType).value,
			description: document.querySelector(DOMstrings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem:function(obj, type){
			var html, newHtml, element;
			// create html string with placeholder text 
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			} else if (type === 'exp'){
				element = DOMstrings.expenseContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// replace the placeholder text with input 
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert the html into the dom 
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorId){

			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);

		},

		clearFields: function(){
			var fields, fieldsArr ;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array){
				current.value = "";
			});
			fieldsArr[0].focus();
		},

		displayBudget: function(obj){

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}

		},

		displayPercentages: function(percentages){

			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

			nodeListForEach(fields, function(current, index){
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},

		displayMonth: function(){
			var now, year, month, months;
			var now = new Date();
			months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);

			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMstrings: function(){
			return DOMstrings;
		}
	};

})();

// GLOBAL APP CONTROLLER
// this is the controller that reads data from UI and then connects to budget (data) controller
// modules can receive arguments, they are just function expressions
// we will pass the other two modules as arguments to the controller so that this controller knows about the other two
// parameters are budgetCtrl and UICtrl and when we call the function at the end we invoke the function with the two other modules
// event handlers are controlled here, central place where we decide what happens upon event and then delegate tasks to other controllers 

var controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners = function(){
	
	var DOM = UICtrl.getDOMstrings();

	document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

	document.addEventListener('keypress', function(event){
		if (event.keyCode === 13 || event.which === 13) {
			ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};


	var updateBudget = function(){
		// Calculate the budget
		budgetCtrl.calculateBudget();
		// return the budget 
		var budget = budgetCtrl.getBudget();
		// display the budget on the UI passes in the object from the get budget method 
		UICtrl.displayBudget(budget);
		//console.log(budget);
	};

	var updatePercentages = function(){
		// calculate percentages 
		budgetCtrl.calculatePercentages();

		// read perentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// update the ui with the new percentages 
		UICtrl.displayPercentages(percentages);
	};


	var ctrlAddItem = function(){
		var input, newItem;
		// get input data
		input = UICtrl.getinput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0){
		// add the item to the budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		// add the item to the ui
		UICtrl.addListItem(newItem, input.type);
		// clear the fields
		UICtrl.clearFields();
		// calculate the budget 
		updateBudget();

		// calculate and update the percentages 
		updatePercentages();

		}

	};

	// we need event delegation 
		var ctrlDeleteItem = function(event){
			var itemID, splitID, type, ID;

			itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

			if (itemID) {
				splitID = itemID.split('-');
				type = splitID[0];
				ID = parseInt(splitID[1]);

			// delete the item from the data structure 
			budgetCtrl.deleteItem(type, ID);

			// delete from the UI pass in item id
			UICtrl.deleteListItem(itemID);
			// update and show the new budget 
			updateBudget();

			// calcuate and update percentages 
			updatePercentages();

			}

		};

	return {
		init: function(){
			// console.log('Application has started');
			// pass the budget as 0 so in the beginning it displays as 0
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	}

})(budgetController, UIController);


controller.init();