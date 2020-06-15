// Default projects, filters and tasks

import moment from 'moment';

import {
  Filter, Project, Task, SubTask,
} from './models';

export const DEFAULT_FILTERS = [Filter('All', () => true, 'assets/icons/default/all.png'),
  Filter('Due Today', (task) => {
    const date = Date.parse(task.dueDate);
    return date >= moment().startOf('day').toDate() && date < moment().endOf('day').toDate();
  }, 'assets/icons/default/today.png'),
  Filter('Due This Week', (task) => {
    const date = Date.parse(task.dueDate);
    return date >= moment().startOf('isoWeek').toDate() && date < moment().endOf('isoWeek').toDate();
  }, 'assets/icons/default/week.png'),
  Filter('Highest Priority', (task) => task.priority === 10, 'assets/icons/default/important.png'),
  Filter('With Sub Tasks', (task) => task.subTasks && task.subTasks.length > 0, 'assets/icons/default/complex.png')];

export const DEFAULT_PROJECTS = [Project('Default filters above', 'assets/icons/default/up.png'),
  Project('Click projects for tasks', 'assets/icons/2.png'),
  Project('Double click to edit', 'assets/icons/3.png'),
  Project('Custom projects below', 'assets/icons/default/down.png')];

const subTasks = [SubTask('You can create or check off subtasks'), SubTask('Or delete them if you are done')];
export const DEFAULT_TASKS = [Task('Click left to complete tasks', 'All', 'Tasks can have descriptions', '', 10),
  Task('Click on this task to expand it', 'All', '', '', 6, subTasks),
  Task('Create Tasks with a title below and edit them to fill in details', 'All', '', ''),
  Task('Or click on the button to the right to fill in initial details', 'All', '', '', 4),
  Task('Search for any string in Quick find above to list any tasks containing that name', 'All', '', '', 3),
  Task('You can also add Tasks without Projects and see them in the default filters', 'All', '', '', 8),
  Task('You create new stuff by pressing enter after putting in the text', 'All', '', '', 9),
  Task('Or you can also click the little + icon to create', 'All', '', '', 7),
  Task('Priorities can be set from 0 to 10 and will be colored accordingly')];
