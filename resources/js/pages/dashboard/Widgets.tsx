import ScrollSpy from '../../components/base/ScrollSpy';
import WidgetStats from '../../components/modules/widgets/WidgetStats';
 import WidgetsScrollspyNav from '../../components/modules/widgets/WidgetsScrollspyNav';
import React from 'react';

const Widgets = () => {
  return (
    <div className="mb-9" style={{marginTop:"2rem"}}>
      <ScrollSpy>
        {/* <WidgetsScrollspyNav /> */}

        <ScrollSpy.Content id="stats" className="widgets-scrollspy">
          <WidgetStats />
        </ScrollSpy.Content>
      </ScrollSpy>
    </div>
    
  );
};

export default Widgets;
