// Module1
var budgetController = (function()
{
    // fuction contructor of Expense and Income - if any more functionality needs tobe add - 
    // we can add it using prototype function.
    var Expense = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage= -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome > 0)
        {
            this.percentage = Math.round((this.value/ totalIncome ) * 100);
        }else
        {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    };


    var Income = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    // creating object to hold all the data - check how functin consturctor is created and how object is defined.

    var data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0 
            },
            budget: 0,
            percentage: -1 // like initially doesnot exist
          };
    var calculateTotal = function(type)
    {
        var sum =0;
        data.allItems[type].forEach(function(current){
            sum = sum+ current.value;
        });
        data.totals[type] = sum;
    }
    
    return{
        addItem: function(type,des,val)
        {
            var newItem,ID;
            // [1 2 3 4 5], nextId = 6;
            // [1 2 3 6 8], nextID = 9;
            // id = lastID + 1

            //create new ID
            if(data.allItems[type].length > 0)
            {
               ID= data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else {
                ID = 0;
            }
            //create new Item bsaaed on inc or exp
            if(type=== 'exp')
            {
                newItem = new Expense(ID,des,val);
            }else if(type === 'inc')
            {
                newItem = new Income(ID,des,val);
            }
            // push it into our data sstructure
            data.allItems[type].push(newItem);

            //return 
            return newItem;
        },

        deleteItem: function(type,id)
        {
            var ids,index;
            // id = 6;
            // [1 2 4 6 8]
            // index = 3
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            // indexOf will return -1 when no item found

            if(index !== -1)
            {
                data.allItems[type].splice(index,1);
                // delete only that item .splice ( ,1)
            }


        },
        calculateBudget: function()
        {
            //1.  calculate total income and expense
            // we can make private function(calculate total) as we dont want to have access to budget
            calculateTotal('inc');
            calculateTotal('exp');

            //2.  calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;                        

            //3. calclate the percentage of income that we spent
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc ) * 100);
            }
            else
            {
                data.percentage = -1;
            }
        
        },
        calclatePercentages: function()
        {
            data.allItems.exp.forEach(function(current)
            {
                current.calcPercentage(data.totals.inc);
            });

        },
        getPercentages: function()
        {
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function()
        { // we need to send 4 values  - hence use Objects.
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
            
        },
        testing: function()
        {
            console.log(data);
        }
    }


    
})();

var UIController = (function()
{
    var DOMStrings  = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        DateLabel: '.budget__title--month'
    };
//private functions 
   var formatNumber=function(num,type)
    {
        var numSplit,int,dec,type;
        /* 
            + or - before number
            exactly 2 decimal points 
            comma separating the thousands 

        */

        num  = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];

        if(int.length > 3)
        {
            int = int.substr(0, int.length - 3) +','+int.substr(int.length - 3,3);
        }
        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+'

        return sign+' '+int+"."+dec;
        // return (type === 'exp' ? '-' : '+')+' ' + int + dec;
    };
    var nodeListForEach = function(list,callback){
        for(var i=0;i<list.length;i++)
        {
            callback(list[i],i);
            // for each iteration callback is called
        }
    };
    return{
        getInput: function()
        { // as we need to send all the 3 values  to controller - this needs to be object then
         return{
                 type:document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
                 description: document.querySelector(DOMStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
               };
        },
        addListItem: function(obj,type)
        {
            var html,newHtml,element ;
            // create HTML string with placeholder text;
            if(type === 'inc')
            {   element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div>
                        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`
             } else if(type === 'exp')
             {element = DOMStrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`
             }
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            // Insert the HTML into DOM
            // insertAdjacentHTMl -> https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(selectorID)
        {
            //for removing we need to remove child - for that we need to know parent
           var el = document.getElementById(selectorID);
           el.parentNode.removeChild(el);
            
        },
        clearFields: function()
        {   var fields,fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription+', '+DOMStrings.inputValue);
            // output is list and not array - we need array;
                // A trick here now ; Array is parent object of any array and we need there prototype function slice and - then use of call 
            fieldsArr  = Array.prototype.slice.call(fields);
            fieldsArr.forEach( function(current,index,array){
                //current will be first inputDescription then inputValue
                current.value = "" ;
            });
            fieldsArr[0].focus(); // focus on description ; if we dont put this, focus will be on value ;(i.e last used field)
        },
        displayBudget: function(obj)
        {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0)
            {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages)
        {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
               
            // ultimate dimag - High order function
                    
            var nodeListForEach = function(list,callback){
                for(var i=0;i<list.length;i++)
                {
                    callback(list[i],i);
                    // for each iteration callback is called
                }
            };
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index]> 0)
                {
                current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '---'
                }
           
            });

        },
        displayMonth: function()
        {
            var now,year,month;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.DateLabel).textContent = months[month]+' '+year;
        },
        changedType: function()
        {
            var fields = document.querySelectorAll(
              DOMStrings.inputType + ','+
              DOMStrings.inputDescription + ',' +
              DOMStrings.inputValue);
                    // querySelectorAll returns a NodeList and not an Array - we can then transform it into  
                    //; Array.prototype.slice.call(fields)

                nodeListForEach(fields,function(current){
                    current.classList.toggle('red-focus');
                });

                document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            },
        getDOMStrings: function()
        {
            return DOMStrings;
        }

    }
})();

var controller = (function(budgetCtrl,UICtrl){

var SetupEventListeners = function(){// almost all our EventListener are here
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click',CtrlAddItem);
    
    document.addEventListener('keypress',function(event)
   {
       if(event.keyCode===13 || event.which === 13)
       {
           CtrlAddItem();
       }
   });

   document.querySelector(DOM.container).addEventListener('click',CtrlDeleteItem);
// very imp to understand - why we choose container as parent or target for this 
// deletion of item

   document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

};

    var updateBudget = function()
    {
    //1. calculate the budget;
    budgetCtrl.calculateBudget();
    //2.return budget
    var budget = budgetCtrl.getBudget();
    //3. display budget on UI

    UICtrl.displayBudget(budget);

    };

    var updatePercentages = function()
    {
        //1.Calculate percentages
        budgetCtrl.calclatePercentages();
        //2.Read Percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3.Update the UI with new percentages
    UICtrl.displayPercentages(percentages);

    };

    var CtrlAddItem = function()
    {
        var input,newItem;

        //1. Get the field i/p data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {

        //2. Add the item to budget controller
        newItem  = budgetCtrl.addItem(input.type,input.description,input.value);
        //3. Add the item to UI
        UICtrl.addListItem(newItem,input.type);
        //4. clear the fields
        UICtrl.clearFields();

        //5. Calculate and update budget ; // creating new function as it will need us when deleting the budget also.
        updateBudget(); 

        //6.Display the budget on the UI.
        updatePercentages();
        }
    };
    var CtrlDeleteItem = function(event)
    {
        var itemID,splitId,type,ID;

       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID)
        {
            splitId=itemID.split('-');
            type=splitId[0];
            ID= parseInt(splitId[1]);
            
            console.log("type: "+type+"ID: "+ID);
        //1. delte the item fromdata structure
            budgetCtrl.deleteItem(type,ID);
        //2. delete the item fron UI
            UICtrl.deleteListItem(itemID);
        //3. Update and show the new budget.
            updateBudget();

        }

    };
return {
    init: function(){
        console.log("Applucation Started");
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
        SetupEventListeners();
    }

}

})(budgetController,UIController);

controller.init();


