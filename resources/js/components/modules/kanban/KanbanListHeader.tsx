import React, {
  CSSProperties,
  Dispatch,
  Fragment,
  SetStateAction
} from 'react';
import {
  UilArrowFromRight,
  UilLeftArrowToLeft
} from '@iconscout/react-unicons';
import Button from '../../../components/base/Button';

import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

interface KanbanListHeaderProps {
  list: KanbanBoardItem;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  taskCount: number;
}

const kanbanHeaderActions = [
  {
    id: 1,
    label: 'Sort tasks',
    isNested: true
  },
  {
    id: 2,
    label: 'Sort all tasks'
  },
  {
    id: 3,
    label: 'Move all tasks',
    isNested: true
  },
  {
    id: 4,
    label: 'Remove all tasks'
  },
  {
    id: 5,
    hr: true
  },
  {
    id: 6,
    label: 'Import'
  },
  {
    id: 7,
    label: 'Export',
    isNested: true
  },
  {
    id: 8,
    hr: true
  },
  {
    id: 9,
    label: 'Move column',
    isNested: true
  },
  
  {
    id: 11,
    label: 'Delete column'
  },
  {
    id: 12,
    label: 'Archive column'
  },
 
  {
    id: 14,
    label: 'Edit title & description'
  },
 
];

const KanbanListHeader = ({
  list,
  collapsed,
  setCollapsed,
  taskCount 
}: KanbanListHeaderProps) => {

  console.log('list',list); 
  return (
    <div className="kanban-column-header px-4 hover-actions-trigger">
      <div
        className={`d-flex align-items-center border-bottom border-3 py-3`}
        style={
          {
            '--phoenix-border-color': list.borderColor
          } as CSSProperties
        }
      >
        <h5 className="mb-0 kanban-column-title">
          {list.title}
          <span className="kanban-title-badge">{taskCount}</span>
        </h5>
       
        <Button
          className="ms-auto kanban-collapse-icon p-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <UilArrowFromRight size={16} />
          ) : (
            <UilLeftArrowToLeft size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default KanbanListHeader;
