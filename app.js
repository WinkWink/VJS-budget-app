// module pattern IIFE that will return an obj
var budgetController = (function(){
 	
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

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

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function(){
			//console.log(data);
		}
	}

})();

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
		container: '.container'
	}

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

				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			} else if (type === 'exp'){
				element = DOMstrings.expenseContainer;

				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// replace the placeholder text with input 
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', obj.value);

			// insert the html into the dom 
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

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
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}

		},

		getDOMstrings: function(){
			return DOMstrings;
		}
	};

})();

// GLOBAL APP CONTROLLER
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

		}


	};

	// we need event delegation 
		var ctrlDeleteItem = function(event){
			console.log(event.target);
		};

	return {
		init: function(){
			// console.log('Application has started');
			// pass the budget as 0 so in the beginning it displays as 0
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