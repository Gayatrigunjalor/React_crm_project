// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faCalendarXmark,
//   faUser,
//   faHourglassHalf,
// } from '@fortawesome/free-solid-svg-icons';
// import { Card } from 'react-bootstrap';
// import classNames from 'classnames';
// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../axios';

// const KanbanListItemCard = ({ id, task, className, boardColor }: KanbanListItemCardProps) => {
//   const [data, setData] = useState<any>(null);  // To store response data
//   const [error, setError] = useState<string>(''); // To store any errors

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem('token');
//       const cleanToken = token && token.split('|')[1]; 
  
//       console.log(cleanToken);
  
//       const userPermissions = localStorage.getItem('user_permission');
//       const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;
  
//       const userId = parsedPermissions ? parsedPermissions.user_id : null;
//         // const isAdmin = localStorage.getItem('user_role').replace(/"/g, '') === "ADMIN";
//         const userRole = localStorage.getItem('user_role');
//         const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";

//       console.log('id and admin is ',userId,isAdmin);
//       // Construct the correct URL with dynamic values
//       const endpoint = `/tasks/employee_task/${userId}/${isAdmin ? 1 : 0}`;
//   console.log('endpoint is',endpoint);
//       try {
//         const response = await axiosInstance.get(endpoint, {
//           headers: {
//             Authorization: `Bearer ${cleanToken}`, 
//           },
//         });
//         setData(response.data);  // Store the response in state
//       } catch (err) {
//         setError('Error fetching data');
//         console.error(err);
//       }
//     };
  
//     fetchData();
//   }, []);
//     // Empty dependency array to run the effect only once after the component mounts

//   return (
//     <div>
//       {/* Your existing KanbanCard rendering */}
//       <Card className={classNames(className, 'sortable-item')}>
//         <Card.Body className="p-3">
//           <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: boardColor }}>
//             {task.name}
//           </h6>
//           {/* Render the fetched data here if needed */}
//           <div>{data ? JSON.stringify(data) : error}</div>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default KanbanListItemCard;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarXmark,
  faUser,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from 'react-bootstrap';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../axios';

const KanbanListItemCard = ({ id, task, className, boardColor }: KanbanListItemCardProps) => {
  const [data, setData] = useState<any>(null);  // To store response data
  const [error, setError] = useState<string>(''); // To store any errors

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const cleanToken = token && token.split('|')[1]; 
  
      const userPermissions = localStorage.getItem('user_permission');
      const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : null;
  
      const userId = parsedPermissions ? parsedPermissions.user_id : null;
      const userRole = localStorage.getItem('user_role');
      const isAdmin = userRole !== null && userRole.replace(/"/g, '') === "ADMIN";
  
      // Construct the correct URL with dynamic values
      const endpoint = `/tasks/employee_task/${userId}/${isAdmin ? 1 : 0}`;
  
      try {
        const response = await axiosInstance.get(endpoint, {
          headers: {
            Authorization: `Bearer ${cleanToken}`, 
          },
        });
        setData(response.data);  // Store the response in state
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      }
    };
  
    fetchData();
  }, []);

  // Helper function to filter tasks by stage_id and remove null values
  const filterTasksByStage = (stageId: number) => {
    const stage = data?.stages?.find((stage: any) => stage.id === stageId);
    return stage ? stage.tasks.filter((task: any) => task) : [];
  };

  const renderTaskDetails = (task: any) => {
    const taskDetails: JSX.Element[] = [];
    const keys = ['title', 'priority', 'start_date', 'due_date', 'e_hours', 'e_minutes', 'e_seconds', 'task_type'];

    keys.forEach((key) => {
      if (task[key] !== null && task[key] !== undefined) {
        taskDetails.push(
          <div key={key} className="task-detail">
            <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {task[key]}
          </div>
        );
      }
    });

    return taskDetails;
  };

  const renderStageTasks = (stageId: number) => {
    const tasks = filterTasksByStage(stageId);

    return tasks.map((task: any) => (
      <Card key={task.id} className={classNames(className, 'sortable-item')}>
        <Card.Body className="p-3">
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: boardColor }}>
            {task.title}
          </h6>
          {renderTaskDetails(task)}
        </Card.Body>
      </Card>
    ));
  };

  return (
    <div>
      {/* Render tasks for stage with id: 2 (To Do) */}
      <div>
        <h5>To Do</h5>
        {renderStageTasks(2)} {/* "To Do" stage with id 2 */}
      </div>

      {/* Render tasks for stage with id: 3 (In Progress) */}
      <div>
        <h5>In Progress</h5>
        {renderStageTasks(3)} {/* "In Progress" stage with id 3 */}
      </div>

      {/* You can repeat the render for other stages like "Completed" with id: 4 */}
      <div>
        <h5>Completed</h5>
        {renderStageTasks(4)} {/* "Completed" stage with id 4 */}
      </div>
    </div>
  );
};

export default KanbanListItemCard;
