//////// ELEMENT QUERIES /////////

const form = document.getElementById('task-input-form');
const taskList = document.querySelector('.grid');
const clearTaskBtn = document.querySelector('#clear-tasks');
const filter = document.querySelector('#filter')
const taskInput = document.querySelector('.task-input');
const timeInput = document.querySelector('.deadline');
const timeUnitInput = document.querySelector('#timeUnits');


//////// HELPER FUNCTIONS /////////

//LOAD ALL EVENT LISTENERS
loadEventListeners();

function loadEventListeners() {
    document.addEventListener('DOMContentLoaded', getTasks);
    form.addEventListener('submit', addTask);
    document.addEventListener('click', removeTask);
    clearTaskBtn.addEventListener('click', removeAllTasks);
    filter.addEventListener('keyup', filterTasks);
}

//QUERY ALL TASKS THAT ARE CURRENTLY IN THE DOM
function queryAllTasks() {
    return document.querySelectorAll('.card-body')
}

//CONVERT TIME INPUT FROM FORM TO MINUTES
function timeConvertMinutes(time, unit){
    switch(unit){
        case 'min' :
            return time;
            break
        case 'h' :
            return time*60;
            break
        case 'd' :
            return time*1440;
            break
        case 'w' :
            return time*10080;
            break
        case 'mn' :
            return time*43000;
            break
        }
}

//CONVER MILISECONDS TO TIME OBJECT DD:HH:MM:SS
function convertMs(milliseconds) {
    let day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}

//CHECK FOR DUPLICATES BETWEEN IPUT AND TASKS TASK CONTENT
function checkForDuplicates(array, checkedInput){
    for(const item of array){
        if(item.content === checkedInput.value){
            return true;
        }
    }
}




//////// FEATURES ON TASKS /////////

//CREATE TASK ELEMENT WITH INPUT
function createTask(task, index){
    const {timeAdded, content} = task;
    //CREATING TASK ELEMENT
    const taskItem = document.createElement('div');
    taskItem.className = 'card text-center';
    taskItem.style.width ='100%';
    taskItem.innerHTML = `                  
    <div class="card-body">
        <h5 class="card-title" style="font-size:1.2rem;">Task nr. ${index}<span class="time-left">${new Date(timeAdded).toDateString()}</span></h5>
        <p class="card-text">${content}</p>
        <a href="#" class="btn btn-danger delete">Delete Task</a>
    </div>
    <div class="progress-text"></div>
    <div class="progress-bar">
        <div class="task-progress"></div>
    </div>`;
    return taskItem;
}
//CREATE PROGRESS BAR FUNCTION WITH TIME POPUP
function createProgressBar(task, taskItem){
    const {timeAdded, deadlineTimeInMinutes} = task
    const timeLeftElement = taskItem.children[1];
    const taskProgress = taskItem.lastChild.children[0];

    //CALCULATING PROGRESS BAR
    const timeRegistered = new Date(timeAdded);
    const timeFinish = new Date(new Date(timeAdded).setMinutes(parseInt(
    new Date(timeAdded).getMinutes()) + parseInt(deadlineTimeInMinutes)));

    //CALCULATION PROGRESS BAR WIDTH IN INTERVAL
    let progressInterval = setInterval(function(){
        let timeNow = new Date();
        let processMeter =  Math.floor((timeFinish.getTime() - timeNow.getTime()) / (timeFinish.getTime() - timeRegistered.getTime()) * 100);
        taskProgress.style.width = `${processMeter}%`
        let timeLeft = convertMs((timeFinish.getTime() - timeNow.getTime()));
        if((timeFinish.getTime() - timeNow.getTime()) > 0){
        timeLeftElement.textContent='';
        timeLeftElement.appendChild(document.createTextNode(`${timeLeft.day} : ${timeLeft.hour} : ${timeLeft.minute} : ${timeLeft.seconds}`))
        }else{
        timeLeftElement.textContent = 'Time is up';
        }
    //STYLING THE PROCESSBAR / CLEARING INTERVAL
        if (processMeter < 75){
            taskProgress.style.backgroundColor =  'rgb(154, 194, 62)';
        }
        if (processMeter < 50){
            taskProgress.style.backgroundColor =  'rgb(237, 240, 81)';
        }
        if (processMeter < 25){
            taskProgress.style.backgroundColor =  'rgb(219, 91, 40)';
        }  
        if (processMeter < 0) {
            taskProgress.style.backgroundColor =  'rgb(255, 13, 13)'
            taskProgress.style.width = '100%';
            clearInterval(this);
        };
    }, 500);

}



//////// OPERATIONS ON TASKS /////////

// ADD TASK AND REFRESH COUNT
function addTask(e) {
    let tasks = loadTasksFromMemory();
    if(taskInput.value === '' || timeInput.value === '') {
        alert('Please add task and correct value of deadline time')
    }
    else if (checkForDuplicates(tasks, taskInput) === true){
        alert('There is task with the same name on the list')
    }
    else if (timeInput.value <= 0){
        alert('The time for the task is wrong')
    }
    else{
    const deadlineTime = timeConvertMinutes(timeInput.value, timeUnitInput.value)
    const taskInfo = {
        content : taskInput.value,
        deadlineTimeInMinutes : deadlineTime,
        timeAdded : new Date(),
    }
    taskItem = createTask(taskInfo, tasks.length+1);
    taskList.appendChild(taskItem);
    saveInMemory(taskInfo);
    createProgressBar(taskInfo, taskItem);
    taskInput.value = '';
    timeInput.value = '';
    }
}

// REMOVE SINGLE TASK AND REFRESH COUNT OF TASKS
function removeTask (e) {
    if(e.target.classList.contains('delete'))
    {
        if(confirm('Are you sure ?')){
            e.target.parentElement.parentElement.remove();
            removeFromMemory(e.target.parentElement);
        }
    }

}

//REMOVE ALL TASKS
function removeAllTasks() {
    if(confirm('Do you want to clear tasks ?'))
    {
         while(taskList.firstChild){
            taskList.removeChild(taskList.firstChild);
        }
    }
    removeAllTasksFromMemory();
}

// FILTER TASKS
function filterTasks(e) {
    const filteredPhrase = e.target.value.toLowerCase();
    queryAllTasks().forEach(function(task){
        const taskPhrase = task.children[1].textContent;
        if(taskPhrase.toLowerCase().indexOf(filteredPhrase) != -1) {
            task.parentElement.style.display = 'block';
        }
        else{
            task.parentElement.style.display = 'none';
        }

    })

}



//////// BROWSER MEMORY MANAGEMENT FUNCTIONS/////////

// LOAD MEMORY FROM LOCAL STORAGE OR CREATE NEW TASKS ARRAY
function loadTasksFromMemory(){
    let tasks;
    if(localStorage.getItem('tasks') === null){
        tasks = [];
    } 
    else{
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
}

// LOAD ALL TASKS FROM BROWSER MEMORY
function getTasks(){
    let tasks = loadTasksFromMemory();

    tasks.forEach(function(task){
        taskItem = createTask(task, tasks.indexOf(task)+1);
        taskList.appendChild(taskItem)
        createProgressBar(task, taskItem);
    })

}

// SAVE TASK INTO BROWSERS MEMORY
function saveInMemory(task){
    tasks = loadTasksFromMemory();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// REMOVE TASK FROM MEMORY
function removeFromMemory(taskItem) {
    tasks = loadTasksFromMemory();
    console.log(taskItem.children[1]);
    tasks.forEach(function(task, index){
        if(taskItem.children[1].textContent === task.content)
        {
            tasks.splice(index, 1);
        }
    })
    localStorage.setItem('tasks', JSON.stringify(tasks));
    location.reload();
}

function removeAllTasksFromMemory(){
    localStorage.clear();
}
