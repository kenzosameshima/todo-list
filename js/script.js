// Confetti function (global)
const Confetti = () => {
  const count = 200,
    defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

document.addEventListener("DOMContentLoaded", () => {
  // === DOM ELEMENTS ===
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskList = document.getElementById("task-list");
  const emptyImage = document.querySelector(".empty-image");
  const todosContainer = document.querySelector(".todos-container");
  const progressBar = document.getElementById("progress");
  const progressNumbers = document.getElementById("numbers");

  // === DOM for multi-list (commented for future use) ===
  /*
  const todosList = document.getElementById("todos-list");
  const addListBtn = document.getElementById("add-list-btn");
  const STORAGE_KEY = "todoApp";
  */

  // === STATE ===
  let currentEditIndex = null;
  let currentEditCompleted = false;
  let errorTimeout;
  let errorMessage = document.getElementById("error-message");
  let hasShownConfetti = false;

  // === Multi-list state (commented out) ===
  /*
  let appData = {
    selectedList: "Default",
    lists: {
      Default: [],
    },
  };
  */

  // === UTILITY FUNCTIONS ===

  function toggleEmptyState() {
    const hasTasks = taskList.children.length > 0;
    emptyImage.style.display = hasTasks ? "none" : "block";
    todosContainer.style.width = hasTasks ? "100%" : "50%";
  }

  // === Sidebar render for list names ===
  /*
  function renderListSidebar() {
    todosList.innerHTML = "";

    Object.keys(appData.lists).forEach((listName) => {
      const li = document.createElement("li");
      li.textContent = listName;
      li.className = listName === appData.selectedList ? "active" : "";
      li.addEventListener("click", () => {
        appData.selectedList = listName;
        saveAppData();
        loadTasks();
        renderListSidebar();
      });
      todosList.appendChild(li);
    });
  }
  */

  function updateProgress() {
    const totalTasks = taskList.querySelectorAll("li").length;
    const completedTasks = taskList.querySelectorAll(".checkbox:checked").length;

    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

    const allComplete = totalTasks > 0 && completedTasks === totalTasks;

    if (allComplete && !hasShownConfetti) {
      Confetti();
      hasShownConfetti = true;
    }

    if (!allComplete) {
      hasShownConfetti = false;
    }
  }

  function showError(message) {
    if (!errorMessage) {
      errorMessage = document.createElement("div");
      errorMessage.id = "error-message";
      const inputArea = document.querySelector(".input-area");
      inputArea.insertAdjacentElement("afterend", errorMessage);
    }

    clearTimeout(errorTimeout);
    errorMessage.textContent = message;
    errorMessage.classList.add("visible");
    taskInput.classList.add("error");

    errorTimeout = setTimeout(() => {
      errorMessage.classList.remove("visible");
      taskInput.classList.remove("error");
    }, 2000);
  }

  function updateEditButtonState(editBtn, isChecked) {
    editBtn.disabled = isChecked;
    editBtn.style.opacity = isChecked ? "0.5" : "1";
    editBtn.style.pointerEvents = isChecked ? "none" : "auto";
  }

  function resetInputAndEditState() {
    taskInput.value = "";
    currentEditIndex = null;
    currentEditCompleted = false;
  }

  function getTasksData() {
    return Array.from(taskList.querySelectorAll("li")).map((li) => ({
      text: li.querySelector("span").textContent,
      completed: li.querySelector(".checkbox").checked,
    }));
  }

  // === Original LocalStorage logic (single-list) ===
  function saveTaskToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(getTasksData()));
  }

  // === Multi-list localStorage logic (commented out) ===
  /*
  function saveAppData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }

  function loadAppData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      appData = JSON.parse(saved);
    }
  }
  */

  // === Original task loader for single-list ===
  function loadTasksFromLocalStorage() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach(({ text, completed }) => addTask(text, completed, null));
    toggleEmptyState();
    updateProgress();
  }

  // === Multi-list loader (commented out) ===
  /*
  function loadTasks() {
    const tasks = appData.lists[appData.selectedList] || [];
    taskList.innerHTML = "";

    tasks.forEach(({ text, completed }) => {
      const li = createTaskElement(text, completed);
      taskList.appendChild(li);
    });

    toggleEmptyState();
    updateProgress();
  }
  */

  function createTaskElement(text, completed) {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? "checked" : ""}>
      <span>${text}</span>
      <div class="task-buttons">
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    const checkbox = li.querySelector(".checkbox");
    const editBtn = li.querySelector(".edit-btn");
    li.classList.toggle("completed", checkbox.checked);
    updateEditButtonState(editBtn, checkbox.checked);

    return li;
  }

  function insertTaskToList(taskElement, index = null) {
    if (index !== null && index >= 0 && index <= taskList.children.length) {
      taskList.insertBefore(taskElement, taskList.children[index]);
    } else {
      taskList.appendChild(taskElement);
    }
  }

  function updateUIAfterChange() {
    toggleEmptyState();
    updateProgress();
    saveTaskToLocalStorage(); // For multi-list, replace this with saveAppData()
    resetInputAndEditState();
  }

  // === CORE FUNCTIONALITY ===
  function addTask(text = "", completed = false, insertAtIndex = null) {
    if (!text) {
      showError("Task cannot be empty! Please enter a task.");
      return;
    }

    const li = createTaskElement(text, completed);
    insertTaskToList(li, insertAtIndex);
    updateUIAfterChange();
  }

  // === Multi-list version of addTask (commented out) ===
  /*
  function addTask(text = "", completed = false, insertAtIndex = null) {
    if (!text) {
      showError("Task cannot be empty! Please enter a task.");
      return;
    }

    const taskData = { text, completed };
    const currentList = appData.selectedList;

    if (!appData.lists[currentList]) {
      appData.lists[currentList] = [];
    }

    if (insertAtIndex !== null) {
      appData.lists[currentList].splice(insertAtIndex, 0, taskData);
    } else {
      appData.lists[currentList].push(taskData);
    }

    const li = createTaskElement(text, completed);
    insertTaskToList(li, insertAtIndex);

    saveAppData();
    updateUIAfterChange();
  }
  */

  function handleCheckboxClick(checkbox) {
    const li = checkbox.closest("li");
    const editBtn = li.querySelector(".edit-btn");
    li.classList.toggle("completed", checkbox.checked);
    updateEditButtonState(editBtn, checkbox.checked);
    updateProgress();
    saveTaskToLocalStorage();
  }

  function handleEditClick(editBtn) {
    const li = editBtn.closest("li");
    const checkbox = li.querySelector(".checkbox");
    if (!checkbox.checked) {
      const currentText = li.querySelector("span").textContent;
      const index = Array.from(taskList.children).indexOf(li);

      taskInput.value = currentText;
      currentEditIndex = index;
      currentEditCompleted = checkbox.checked;

      li.remove();
      toggleEmptyState();
      updateProgress();
      saveTaskToLocalStorage();
    }
  }

  function handleDeleteClick(deleteBtn) {
    const li = deleteBtn.closest("li");
    if (confirm("Are you sure you want to delete this task?")) {
      li.remove();
      toggleEmptyState();
      updateProgress(true);
      saveTaskToLocalStorage();
    }
  }

  // === EVENT LISTENERS ===
  taskList.addEventListener("click", (e) => {
    if (e.target.classList.contains("checkbox")) {
      handleCheckboxClick(e.target);
    } else if (e.target.closest(".edit-btn")) {
      handleEditClick(e.target.closest(".edit-btn"));
    } else if (e.target.closest(".delete-btn")) {
      handleDeleteClick(e.target.closest(".delete-btn"));
    }
  });

  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addTask(taskInput.value.trim(), currentEditCompleted, currentEditIndex);
  });

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask(taskInput.value.trim(), currentEditCompleted, currentEditIndex);
    }
  });

  // === Initialization (current single-list setup) ===
  toggleEmptyState();
  updateProgress();
  loadTasksFromLocalStorage();

  // === Future: use this instead for multi-list ===
  /*
  loadAppData();
  renderListSidebar();
  loadTasks();
  */
});
