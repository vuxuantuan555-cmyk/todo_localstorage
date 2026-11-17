// ======= App: To-Do List using LocalStorage =======
// Schema: each task = { id, title, description, dueDate (yyyy-mm-dd or ''), completed (bool), createdAt (timestamp) }

const STORAGE_KEY = 'todo_localstorage_tasks_v1';

const $ = id => document.getElementById(id);

// Yếu tố
const taskForm = $('taskForm');
const titleInput = $('title');
const descInput = $('description');
const dueInput = $('dueDate');
const taskListEl = $('taskList');
const emptyMsg = $('emptyMsg');
const taskIdInput = $('taskId');
const saveBtn = $('saveBtn');
const clearBtn = $('clearBtn');
const searchInput = $('searchInput');
const filterSelect = $('filterSelect');
const sortSelect = $('sortSelect');

// Tải các tác vụ từ localStorage
function loadTasks(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return [];
  try { return JSON.parse(raw) || []; }
  catch(e){ console.error('Parse error tasks', e); return []; }
}

// Lưu tác vụ vào localStorage
function saveTasks(tasks){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Tạo id duy nhất
function genId(){
  return 't_' + Date.now() + '_' + Math.floor(Math.random()*1000);
}

// Hiển thị các tác vụ với bộ lọc, tìm kiếm, sắp xếp
function render(){
  const tasks = loadTasks();
  let arr = [...tasks];

  // tìm kiếm
  const q = searchInput.value.trim().toLowerCase();
  if(q){
    arr = arr.filter(t => (t.title || '').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
  }

  // lọc
  const filter = filterSelect.value;
  if(filter === 'active') arr = arr.filter(t => !t.completed);
  if(filter === 'completed') arr = arr.filter(t => t.completed);

  // loại
  const sort = sortSelect.value;
  if(sort === 'created_desc') arr.sort((a,b)=> b.createdAt - a.createdAt);
  if(sort === 'created_asc') arr.sort((a,b)=> a.createdAt - b.createdAt);
  if(sort === 'due_asc') arr.sort((a,b)=>{
    if(!a.dueDate) return 1;
    if(!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  if(sort === 'due_desc') arr.sort((a,b)=>{
    if(!a.dueDate) return 1;
    if(!b.dueDate) return -1;
    return b.dueDate.localeCompare(a.dueDate);
  });

  // danh sách rõ ràng
  taskListEl.innerHTML = '';

  if(arr.length === 0){
    emptyMsg.style.display = 'block';
    return;
  } else {
    emptyMsg.style.display = 'none';
  }

  arr.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    // khu vực bên trái
    const left = document.createElement('div');
    left.className = 'left';

    const cb = document.createElement('div');
    cb.className = 'checkbox' + (task.completed ? ' checked' : '');
    cb.innerHTML = task.completed ? '✓' : '';
    cb.addEventListener('click', () => toggleComplete(task.id));

    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = task.title || '(Không tên)';
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = task.description || '';
    meta.appendChild(title);
    if(task.description) meta.appendChild(desc);

    if(task.dueDate){
      const due = document.createElement('div');
      due.className = 'due';
      due.textContent = 'Hạn: ' + task.dueDate;
      meta.appendChild(due);
    }

    left.appendChild(cb);
    left.appendChild(meta);

    // hành động
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit';
    editBtn.textContent = 'Sửa';
    editBtn.addEventListener('click', ()=> startEdit(task.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn delete';
    delBtn.textContent = 'Xóa';
    delBtn.addEventListener('click', ()=> deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    taskListEl.appendChild(li);
  });
}

// Thêm hoặc cập nhật nhiệm vụ
function upsertTask(e){
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const dueDate = dueInput.value || '';

  if(!title){
    alert('Vui lòng nhập tên công việc.');
    titleInput.focus();
    return;
  }

  const tasks = loadTasks();
  const editingId = taskIdInput.value;

  if(editingId){
    // cập nhật
    const idx = tasks.findIndex(t=>t.id === editingId);
    if(idx !== -1){
      tasks[idx].title = title;
      tasks[idx].description = description;
      tasks[idx].dueDate = dueDate;
      // Không thay đổi createdAt hoặc completed
      saveTasks(tasks);
      resetForm();
      render();
      return;
    }
  }

  // tạo mới
  const newTask = {
    id: genId(),
    title,
    description,
    dueDate,
    completed: false,
    createdAt: Date.now()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  resetForm();
  render();
}

// Chuẩn bị biểu mẫu để chỉnh sửa nhiệm vụ
function startEdit(id){
  const tasks = loadTasks();
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  taskIdInput.value = t.id;
  titleInput.value = t.title;
  descInput.value = t.description || '';
  dueInput.value = t.dueDate || '';
  saveBtn.textContent = 'Lưu thay đổi';
}

// Đặt lại biểu mẫu để thêm chế độ
function resetForm(){
  taskForm.reset();
  taskIdInput.value = '';
  saveBtn.textContent = 'Thêm việc';
}

// xóa tác vụ 
function deleteTask(id){
  if(!confirm('Bạn có chắc muốn xóa công việc này?')) return;
  let tasks = loadTasks();
  tasks = tasks.filter(t=> t.id !== id);
  saveTasks(tasks);
  render();
}

// chuyển đổi hoàn tất
function toggleComplete(id){
  const tasks = loadTasks();
  const idx = tasks.findIndex(t=>t.id === id);
  if(idx === -1) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(tasks);
  render();
}

// nút xóa biểu mẫu
clearBtn.addEventListener('click', resetForm);

// sự kiện
taskForm.addEventListener('submit', upsertTask);
searchInput.addEventListener('input', ()=> render());
filterSelect.addEventListener('change', ()=> render());
sortSelect.addEventListener('change', ()=> render());

// kết xuất đầu tiên
render();
