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

  auditTask(taskLi);

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

// Runs every time we make or edit the date of a task
// Needs to clear any previous classes
var auditTask = function (taskEl) {
  var taskDate = taskEl.find("span").text().trim();
  var time = moment(taskDate, "L").set("hour", 17);
  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

}

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
  // $(this).datepicker();
  var date = $(this).text().trim();

  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  $(this).replaceWith(dateInput);

  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      $(this).trigger("change"); // Woah, we can trigger events 
    }
  });

  dateInput.trigger("focus");
});

$(".list-group").on("change", "input[type='text']", function () {
  // get the textarea's current value/text
  var date = $(this).val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // console.log(`${date}, ${status}, ${index}`);
  tasks[status][index].date = date;
  saveTasks();

  // convert input back into p element
  // Create new p elem with right class and text content
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace the old elem with the new one
  $(this).replaceWith(taskSpan);

  // Goin up the DOM tree so we can get the whole list-group-item el
  auditTask($(taskSpan).closest(".list-group-item"));
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

// .sortable() turns every elem with class ".card .list-group into a sortable list
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  // activate: event => console.log("activate", this),
  // deactivate: event => console.log("deactivate", this),
  // over: event => console.log("over", event.target),
  // out: event => console.log("out", event.target),
  update: function (event) {
    var tempArr = [];

    $(this).children().each(function () {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text,
        date,
      });
    });
    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // Okay, so from the this object, we get it's list name with 
    // the .attr("id") method
    // this returns something like "list-toDo"
    // We then get rid of the "list-" part with .replace()
    // Now we just have the toDo, which we use to index into the right property
    // of our tasks object
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  }
});

$("#modalDueDate").datepicker({
  minDate: 1,
});


// load tasks for the first time
loadTasks();


