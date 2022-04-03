var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Adding event listener
$(".list-group").on("click", "p", function () {
  var text = $(this).text(); //.text() is a jQuery method, so we can't use it on something that isn't a jQuery object
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
  console.log(text);
});

// Add event listener to save task when the user clicks outside of it while editing it
$(".list-group").on("blur", "textarea", function () {
  console.log(tasks);
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  console.log(`${text}, ${status}, ${index}`);
  tasks[status][index].text = text;
  saveTasks();

  // convert input back into p element
  // Create new p elem with right class and text content
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  // replace the old elem with the new one
  $(this).replaceWith(taskP);
});

$(".list-group").on("click", "span", function () {
  var date = $(this).text().trim();

  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  $(this).replaceWith(dateInput);
  dateInput.trigger("focus");
  console.log(date);
});

$(".list-group").on("blur", "input[type='text']", function () {
  // get the textarea's current value/text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  console.log(`${date}, ${status}, ${index}`);
  tasks[status][index].date = date;
  saveTasks();

  // convert input back into p element
  // Create new p elem with right class and text content
  var dateSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace the old elem with the new one
  $(this).replaceWith(dateSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


