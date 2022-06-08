let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
let valueInput = '';
let input = null;

window.onload = init = async () => {
  input = document.getElementById('add-task');
  input.addEventListener('change', updateValue);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  const response = await fetch('http://localhost:8000/allTasks', {
    method: 'GET',
  });
  const result = await response.json();
  allTasks = result.data;
  console.log(result);
  render();
};

const onClickButton = async () => {
  const response = await fetch('http://localhost:8000/createTask', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json;charset=utf-8',
      'Access-control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      text: valueInput,
      isCheck: false
    })
  });

  const result = await response.json();
  allTasks.push(result.data);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  valueInput = '';
  input.value = '';
  render();
};

const updateValue = (event) => {
  valueInput = event.target.value;
};

const render = () => {
  const content = document.getElementById('content-page');

  while(content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.map((item, index) => {
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task-container';
    const panel = document.createElement('div');
    panel.id = `panel-${index}`;
    panel.className = 'task-container';

    const text = document.createElement('p');
    text.innerText = item.text;
    text.className = item.isCheck ? 'text-task done-text' : 'text-task';
    text.id = `text-${index}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.id = 'check-box';

    checkbox.onchange = onChangeFunc = () => {
      onChangeCheckBox(index);
    };
    
    const editButton = document.createElement('button');
    editButton.className = !allTasks[index].isCheck ? 'buttons' : 'buttons non-visible';
    editButton.id = `edBut-${index}`;
    const deleteButton = document.createElement('button');
    deleteButton.className = 'buttons';
    deleteButton.id = `dltBut-${index}`;
    const deleteAllButton = document.getElementById('delete-all');

    deleteButton.addEventListener("click", () => {
      onClickDeleteButton(index, item.id);
    });

    editButton.addEventListener('click', () => {
      onClickEditButton(index, item.id);
    })

    deleteAllButton.addEventListener('click', onClickDeleteAll);

    const editImg = document.createElement('img');
    editImg.src = 'ProjectPics/edit blue.svg';
    editImg.className = 'imgs';
    const dltImg = document.createElement('img');
    dltImg.src = 'ProjectPics/trash-alt.svg';
    dltImg.className = 'imgs';
    
    editButton.appendChild(editImg);
    deleteButton.appendChild(dltImg);

    panel.appendChild(text);
    panel.appendChild(checkbox);
    panel.appendChild(editButton);
    panel.appendChild(deleteButton);

    container.appendChild(panel);

    content.appendChild(container);
  });
}

const onClickDeleteButton = async (index, id) => {
  allTasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  const response = await fetch(`http://localhost:8000/deleteTask?id=${id}`, {
    method: 'DELETE',
  });
  const result = await response.json();
  
  if (result.message === 'OK') {
    const response = await fetch('http://localhost:8000/allTasks', {
    method: 'GET',
  });
    console.log('worked');
  }
  
  render();
};

const onClickDeleteAll = async () => {
  allTasks.splice(0, allTasks.length);
  localStorage.setItem('tasks', JSON.stringify(allTasks));
  render();
}

const onClickEditButton = (index, id) => {
  const editBlock = document.createElement('div');
  editBlock.id = 'edit-block';

  const editTextField = document.createElement('input');
  editTextField.type = 'text';
  editTextField.value = allTasks[index].text;
  const currentTask = document.getElementById(`task-${index}`);
  currentTask.appendChild(editTextField);

  const acceptChangeButton = document.createElement('button');
  acceptChangeButton.className = 'buttons';
  const acceptImg = document.createElement('img');
  acceptImg.src = 'ProjectPics/check-square.svg';
  acceptImg.className = 'imgs';
  acceptChangeButton.appendChild(acceptImg);
  acceptChangeButton.id = 'change-button';

  const rejectChangeButton = document.createElement('button');
  rejectChangeButton.className = 'buttons';
  const rejectImg = document.createElement('img');
  rejectImg.src = 'ProjectPics/times-square.svg';
  rejectImg.className = 'imgs';
  rejectChangeButton.appendChild(rejectImg);
  rejectChangeButton.id = 'reject-button';

  editBlock.appendChild(acceptChangeButton);
  editBlock.appendChild(rejectChangeButton);
  currentTask.appendChild(editBlock);

  const hidenBlock = document.getElementById(`panel-${index}`);
  hidenBlock.style.display = 'none';

  acceptChangeButton.addEventListener('click', async () => {
    allTasks[index].text = editTextField.value;
    localStorage.setItem('tasks', JSON.stringify(allTasks));

    editBlock.remove();
    hidenBlock.style.display = '';

    let response = await fetch(`http://localhost:8000/updateTask`, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json;charset=utf-8',
        'Access-control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        text: editTextField.value,
        isCheck: false,
        _id: allTasks[index]._id
      })
    });
    let result = await response.json();
    console.log('res', result);
    allTasks = allTasks.map((el) => el._id !== result._id ? el : result);
    console.log(allTasks);

    response = await fetch(`http://localhost:8000/allTasks`, {
      method: 'GET'
    })
    result = await response.json();
    allTasks = result.data;

    render();
  })

  rejectChangeButton.addEventListener('click', () => {
    editBlock.remove;
    hidenBlock.style.display = '';

    render();
  })
}

const onChangeCheckBox = (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;
  localStorage.setItem('tasks', JSON.stringify(allTasks));

  if (allTasks[index].isCheck) {
    document.getElementById(`edBut-${index}`).className = 'buttons non-visible';
  }
  else {
    document.getElementById(`edBut-${index}`).className = 'buttons';
  }

  if(allTasks[index].isCheck) {
    allTasks.push(allTasks[index]);
    allTasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(allTasks));
  }

  render();
}