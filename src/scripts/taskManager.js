document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('#modal form');
  
  // Load saved tasks when page loads
  loadTasks();
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskInput = document.getElementById('task');
    const taskText = taskInput.value.trim();
    
    if (taskText) {
      addNewTask(taskText);
      taskInput.value = '';
      document.getElementById('modal').close();
    }
  });

  document.getElementById('taskList').addEventListener('click', function(e) {
    if (e.target.type === 'checkbox') {
      handleTaskMove(e.target);
    } else if (e.target.classList.contains('delete-btn')) {
      deleteTask(e.target.closest('tr'));
      saveTasks();
    }
  });

  // Add sorting state object
  const sortState = {
    todo: 'none',      // 'none', 'asc', or 'desc'
    progress: 'none',
    done: 'none'
  };

  // Add event listeners for sorting buttons
  document.querySelectorAll('.sort-btn').forEach(button => {
    button.addEventListener('click', function() {
      const column = this.dataset.column;
      
      // Update sort state
      switch(sortState[column]) {
        case 'none':
          sortState[column] = 'asc';
          break;
        case 'asc':
          sortState[column] = 'desc';
          break;
        case 'desc':
          sortState[column] = 'asc';
          break;
      }

      sortTasksByPriority(column, sortState[column]);
    });
  });
});

function addNewTask(taskText, taskId = `task_${Date.now()}`, status = 'todo', priority = '1') {
  const taskList = document.getElementById('taskList');
  
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>
      <span>Задача</span>
      <input type="checkbox" id="todo_${taskId}" class="todo-checkbox" data-task-id="${taskId}" />
      <label for="todo_${taskId}">${taskText}</label>
    </td>
    <td>
      <span>В процессе</span>
      <input type="checkbox" id="progress_${taskId}" class="progress-checkbox" data-task-id="${taskId}" style="display: none;" />
      <label for="progress_${taskId}" style="display: none;">${taskText}</label>
    </td>
    <td>
      <span>Выполнена</span>
      <input type="checkbox" id="done_${taskId}" class="done-checkbox" data-task-id="${taskId}" style="display: none;" />
      <label for="done_${taskId}" style="display: none;">${taskText}</label>
    </td>
    <td>
      <span>Прочее</span>
      <div class="priority-menu">
        <select class="priority-select">
          <option value="1">Высокий (1)</option>
          <option value="2">Средний (2)</option>
          <option value="3">Низкий (3)</option>
        </select>
      </div>
      <div class="delete_button">
        <button type="button" class="delete-btn">Удалить</button>
      </div>
    </td>
  `;
  
  taskList.appendChild(newRow);

  // Set the priority value
  const prioritySelect = newRow.querySelector('.priority-select');
  prioritySelect.value = priority;

  // Add change event listener to save tasks when priority changes
  prioritySelect.addEventListener('change', saveTasks);

  // Set the correct status for the task
  if (status !== 'todo') {
    const row = newRow;
    const todoCheckbox = row.querySelector(`#todo_${taskId}`);
    const progressCheckbox = row.querySelector(`#progress_${taskId}`);

    if (status === 'progress') {
      todoCheckbox.checked = true;
      handleTaskMove(todoCheckbox);
    } else if (status === 'done') {
      todoCheckbox.checked = true;
      handleTaskMove(todoCheckbox);
      progressCheckbox.checked = true;
      handleTaskMove(progressCheckbox);
    }
  }

  if (status === 'todo') {
    saveTasks();
  }
}

function handleTaskMove(checkbox) {
  const taskId = checkbox.dataset.taskId;
  const row = checkbox.closest('tr');
  
  const todoCheckbox = row.querySelector(`#todo_${taskId}`);
  const todoLabel = row.querySelector(`label[for="todo_${taskId}"]`);
  const progressCheckbox = row.querySelector(`#progress_${taskId}`);
  const progressLabel = row.querySelector(`label[for="progress_${taskId}"]`);
  const doneCheckbox = row.querySelector(`#done_${taskId}`);
  const doneLabel = row.querySelector(`label[for="done_${taskId}"]`);

  if (checkbox.classList.contains('todo-checkbox') && checkbox.checked) {
    hideElement(todoCheckbox);
    hideElement(todoLabel);
    showElement(progressCheckbox);
    showElement(progressLabel);
  } else if (checkbox.classList.contains('progress-checkbox') && checkbox.checked) {
    hideElement(progressCheckbox);
    hideElement(progressLabel);
    showElement(doneCheckbox);
    showElement(doneLabel);
    doneCheckbox.checked = true;
  } else if (checkbox.classList.contains('done-checkbox') && !checkbox.checked) {
    hideElement(doneCheckbox);
    hideElement(doneLabel);
    showElement(progressCheckbox);
    showElement(progressLabel);
    progressCheckbox.checked = false;
  }

  // Save tasks immediately after any status change
  saveTasks();
}

function deleteTask(row) {
  row.remove();
}

function hideElement(element) {
  element.style.display = 'none';
}

function showElement(element) {
  element.style.display = '';
}

function saveTasks() {
  const taskList = document.getElementById('taskList');
  const tasks = [];
  
  taskList.querySelectorAll('tr').forEach(row => {
    const taskId = row.querySelector('[data-task-id]')?.dataset.taskId;
    if (!taskId) return;

    const taskText = row.querySelector(`label[for="todo_${taskId}"]`)?.textContent;
    const status = getTaskStatus(row, taskId);
    const priority = row.querySelector('.priority-select').value;
    
    tasks.push({
      id: taskId,
      text: taskText,
      status: status,
      priority: priority
    });
  });
  
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (!savedTasks) return;
  
  // Clear existing tasks
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  
  const tasks = JSON.parse(savedTasks);
  tasks.forEach(task => {
    addNewTask(task.text, task.id, task.status, task.priority);
  });
}

function getTaskStatus(row, taskId) {
  const doneCheckbox = row.querySelector(`#done_${taskId}`);
  const progressCheckbox = row.querySelector(`#progress_${taskId}`);
  
  if (doneCheckbox.style.display !== 'none') return 'done';
  if (progressCheckbox.style.display !== 'none') return 'progress';
  return 'todo';
}

function sortTasksByPriority(column, direction) {
  const taskList = document.getElementById('taskList');
  const rows = Array.from(taskList.querySelectorAll('tr'));

  // Filter rows based on the column
  const filteredRows = rows.filter(row => {
    const checkbox = row.querySelector(`.${column}-checkbox`);
    return checkbox && checkbox.style.display !== 'none';
  });

  // Sort rows by priority
  filteredRows.sort((a, b) => {
    const priorityA = parseInt(a.querySelector('.priority-select').value);
    const priorityB = parseInt(b.querySelector('.priority-select').value);
    
    // Apply sort direction
    return direction === 'asc' 
      ? priorityA - priorityB 
      : priorityB - priorityA;
  });

  // Keep non-filtered rows in their original positions
  const otherRows = rows.filter(row => !filteredRows.includes(row));
  
  // Clear the table
  taskList.innerHTML = '';
  
  // First append sorted rows, then other rows
  filteredRows.forEach(row => taskList.appendChild(row));
  otherRows.forEach(row => taskList.appendChild(row));
}
