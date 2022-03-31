import axios from 'axios';

const url = 'https://jsonplaceholder.typicode.com/todos/1';

// Objectの型定義
interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

axios.get(url).then((res) => {
    console.log(res.data);

    const todo = res.data as Todo;
    const ID = todo.id;
    const title = todo.title;
    const completed = todo.completed;
});

const logTodo = (id: number, title: string, completed: boolean) => {
    console.log(`
    ID: ${id}
    title: ${title}
    finished: ${completed}
    `);
};

