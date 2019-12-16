// module pattern IIFE that will return an obj
var budgetController = (function(){
 	
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

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