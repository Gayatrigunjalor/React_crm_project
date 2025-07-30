import { Outlet } from "react-router-dom";
import KanbanHeader from "../../components/modules/kanban/KanbanHeader";

const KanbanLayout = () => {
  return (
    <>
    <div className="kanban-layout">
 
      <KanbanHeader/>

     
      <div className="kanban-content">
        <Outlet/>
      </div>
    </div> 
    </>
  );
};

export default KanbanLayout;
