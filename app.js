
//DATA module
var budgetController = (function(){

  //expense constructor function
  var Expense = function(id,description,value){
    this.id = id;
    this.description =  description;
    this.value = value;
    this.percentage = -1;
  };

  //for calcullating percentage
  Expense.prototype.calcPercentage = function(totalIncome){
    if (totalIncome>0){
      this.percentage = Math.round((this.value/totalIncome) *100)
  }
  else{
    this.percentage = -1;
  }
};

//for returning percentage
Expense.prototype.getPercentage = function(){
  return this.percentage;
}


  //income constructor function
  var Income = function (id,description,value){
    this.id = id;
    this.description =  description;
    this.value = value;
  };

  var calculateTotal = function(type){
     var sum = 0;

     budgetData.allitems[type].forEach(function(cur){
       if(isNaN(cur.value)){
          cur.value =0;
          sum +=cur.value;
       }
       else{
        sum +=cur.value;
       }
        //sum +=cur.value;
     })
      //storing the sum result in total object
      budgetData.total[type] = sum;
  };
//data structure for storing expense,income,budget
  var budgetData = {
    allitems:{
      exp:[],
      inc:[]
    },
    total:{
      exp:0,
      inc:0
    },
    budget:0,
    percentage:-1 //-1 refers to non-existence
  };


  return{
    addItem:function(typ,des,val){
      var newItem,ID;
ID = 0;
//ID = last ID +1;

//create new Id
if(budgetData.allitems[typ].length>0){

ID = budgetData.allitems[typ][budgetData.allitems[typ].length -1].id +1;
}
else{
  ID = 0;
}
//create new item based on type whether its exp or inc
      if (typ === 'exp'){
        newItem = new Expense(ID,des,val);
      }
      else if( typ === 'inc'){
        newItem = new Income(ID,des,val);
      }
//if type == exp push new expense else push new income prototype onto data structure
      budgetData.allitems[typ].push(newItem);
//return the new element
      return newItem;

    },
    deleteItem:function(type,id){
      var ids,index;
    ids =  budgetData.allitems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);

      if(index !== -1){
        budgetData.allitems[type].splice(index,1);
      }

    },
    calculateBudget:function(){
//calculate total income and expense
     calculateTotal('exp');
     calculateTotal('inc');
//calculate the budget :Income - expenses
  budgetData.budget  = budgetData.total.inc - budgetData.total.exp;
//Calculate the Percentage of Income that we spent as integer
 if(budgetData.total.inc>0){
budgetData.percentage = Math.round((budgetData.total.exp/budgetData.total.inc)*100);
 }
 
//  else if(budgetData.total.exp == 0){
//       budgetData.percentage = 0;
//  }

 else{
   budgetData.percentage = -1;
 }

    },
    calculatePercentages:function(){
budgetData.allitems.exp.forEach(function(current){
 current.calcPercentage(budgetData.total.inc);
})
    },
    getPercentages:function(){
var totalPercentages = budgetData.allitems.exp.map(function(current){
      return current.getPercentage();
})
return totalPercentages;
    },
    getBudget:function(){
      return {
        budget:budgetData.budget,
        totalInc:budgetData.total.inc,
        totalExp:budgetData.total.exp,
        percentage:budgetData.percentage
      }
    },
    testing:function(){
      console.log(budgetData);
    }
  };

})();

//UI module
var UIController = (function(){

  //storing all the class as a properties inside an object
var domStrings = {
  inputType:'.add__type',
  inputDesrciption:'.add__description',
  inputValue:'.add__value',
  inputButton:'.add__btn',
  incomeContainer:'.income__list',
  expenseContainer:'.expenses__list',
  budgetValue:'.budget__value',
  budgetIncomeValue:'.budget__income--value',
  budgetExpenseValue:'.budget__expenses--value',
  budgetPercentageValue:'.budget__expenses--percentage',
  container:'.container',
  expensePercentage:'.item__percentage',
  monthname:'.budget__title--month'
};

//querySelectorAll returns a nodeList
   //forEach method for nodeList
   var nodeListForEach = function(nodeList,callback){
       for(var i =0; i<nodeList.length;i++){
         callback(nodeList[i],i);
       }
 };

//for formatting number with comma and number of digits after decimal.
 var formatNumber=function(number,type){
  var numSplit,int,deci,type;
  //calculate absolute value and fixed decimal part upto 2 digit
     number = Math.abs(number);
     number = number.toFixed(2);
     //split integer and decimal part
     //for ex- if number= '215.50' it will return ['250','50']
     numSplit = number.split('.');
     int = numSplit[0];
     deci = numSplit[1];
      
     if(int.length>3){
       int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3)  ;
     }
       
     return(type === 'exp' ? '-': '+') + ' ' + int + '.'+ deci;
     
};

  return {
    getInput:function(){
      return {
        type : document.querySelector(domStrings.inputType).value,//will be either inc or exp
      description : document.querySelector(domStrings.inputDesrciption).value,
      //converting string into number
      value : parseFloat (document.querySelector(domStrings.inputValue).value)
            };
    },
    addListItem:function(obj,type){
      var html,newHtml,element
         //create HTML string with placeholder text
 if(type === 'inc'){
   element =(domStrings.incomeContainer);
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
 }
else if(type === 'exp'){
  element =(domStrings.expenseContainer);
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
}
         //Replace the placeholder text with some actual data
         newHtml =html.replace('%id%',obj.id);
         newHtml = newHtml.replace('%description%',obj.description);
         newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

         //Insert the HTML element into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },
    deleteListIem:function(selectorId){
      var element;

       element = document.querySelector('#'+selectorId);

       element.parentNode.removeChild(element);
  
    },
    clearFields:function(){
      var field,fieldsArray;
      //selection description and value using querySelectorAll which return a Nodelist
      field = document.querySelectorAll(domStrings.inputDesrciption + ','+domStrings.inputValue);
      //converting nodeList into array
      fieldsArray = Array.prototype.slice.call(field);
      //looping through an array
      fieldsArray.forEach(function(current,index,array){
        //clearing both desciption and value box
         current.value = '';
      })
       //focusing back on description box after adding item to budget controller
       fieldsArray[0].focus();
    },
    displayBudget:function(obj){
        // deciding type
        var type ;
        obj.budget>0? type='inc':type='exp';

      var UiBudget,UiIncome,UiExpense,UiPercentage;
      //select budgetValue element
       UiBudget =document.querySelector(domStrings.budgetValue);
      //  select incomeValue element
       UiIncome = document.querySelector(domStrings.budgetIncomeValue);
       //select expensevalue element
       UiExpense = document.querySelector(domStrings.budgetExpenseValue);
       //select percentageValue element
       UiPercentage = document.querySelector(domStrings.budgetPercentageValue);
        //update text content of budget
       UiBudget.innerText = formatNumber(obj.budget,type);
      //  update text content of Income
       UiIncome.innerText = formatNumber(obj.totalInc,'inc');
       //update text content of Expense
       UiExpense.innerText = formatNumber(obj.totalExp,'exp');
       //update percentage Value(percent of income)
       if(obj.percentage>=0){
       UiPercentage.innerText = obj.percentage + '%';
       }
     
    },
    //for each individual expense
    displayPercentage:function(percent){
          var fields;
          fields = document.querySelectorAll(domStrings.expensePercentage);
          // //querySelectorAll returns a nodeList
          // //forEach method for nodeList
          
          nodeListForEach(fields,function(current,index){
            if (percent[index] >0){
            current.innerText = percent[index] + '%';
            }
            else{
              current.innerText = 0;            }
          })
    },

    calculateMonth:function(){
      var now,months,monthNumber,month,year;
       now = new Date();
       months = ['january','Febuary','March','April','May','June','August','September','October','November','December'];
       monthNumber = now.getMonth();
       year = now.getFullYear();
        month = months[monthNumber];
        console.log(month);
        return (month + ' ' + year);
    },
    displayMonth:function(month){
        var monthfield;
        monthfield = document.querySelector(domStrings.monthname);
        monthfield.innerText = month;
    },
    changedType:function(){
      var fields;
      fields = document.querySelectorAll(domStrings.inputType+ ',' + domStrings.inputDesrciption + ',' +domStrings.inputValue);

//querySelectorAll return a nodeList
//toggling inputField Color
    nodeListForEach(fields,function(current){
      current.classList.toggle('red-focus');
    });

    //toggling submit button color
    document.querySelector(domStrings.inputButton).classList.toggle('red');

    },
    getdomStrings:function(){
    {
       return domStrings;
    }
  }
  }
})();

//CONTROLLER module
var controller = (function(budget,UI){
  
var setUpEventListener = function(){
  var DOM = UIController.getdomStrings();
 
  document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

  document.body.addEventListener('keypress',function(event){
    //console.log(event);
    if(event.keyCode === 13 || event.which === 13){
      ctrlAddItem();
    }
  });


document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

document.querySelector(DOM.inputType).addEventListener('change',UI.changedType);


};

  

var updateBudget = function(){
  //1.calculate the budget 
       budget.calculateBudget();
  //2.Return the budget
       var nowBudget = budget.getBudget();
  //3.Display the budget on UI
 UI.displayBudget(nowBudget);
};
var updatePercentage = function(){
//1.calculate the percentage
budget.calculatePercentages();
//2.Read percentage from budget controller.
 var percent =budget.getPercentages();
//3. Update the UI with the new percentages
UI.displayPercentage(percent);
};

var ctrlAddItem = function(){
// 1. Get the filed input data
var input = UIController.getInput();

console.log(input);
//2. Add the item to the Budget Controller
 var newItem = budget.addItem(input.type,input.description,input.value);
//

 //input validation
 if(input.description !== '' && !isNaN(input.value) && input.value >0){
   
   //3. Add the item to the UI
UI.addListItem(newItem,input.type);
//4.clear the field
UI.clearFields();
 //5.call updateBudget 
 updateBudget();
 //6. call updatePercentage
 updatePercentage();
 }

};


var ctrlDeleteItem = function(event){
  var itemId,splitId,type,ID;
itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
if(itemId){
splitId = itemId.split('-');
type = splitId[0];
ID = parseInt(splitId[1]);

//1. delete the item from data structure
budget.deleteItem(type,ID);
//2.delete the item from UI
UI.deleteListIem(itemId);
//3.Update and show the new budget
updateBudget();
//4. call updatePercentage
updatePercentage();

}
};

//calculate the monthName
var updateMonthName= UI.calculateMonth();

//update the month
UI.displayMonth(updateMonthName);


return{
  init:function(){
    setUpEventListener();
    
  }
}

})(budgetController,UIController);

controller.init();