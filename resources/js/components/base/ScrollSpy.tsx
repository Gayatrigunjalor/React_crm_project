import classNames from 'classnames';
import ScrollSpyProvider, {
  useScrollSpyContext
} from '../../providers/ScrollSpyProvider';
import { HTMLAttributes, PropsWithChildren, useEffect } from 'react';
import { Nav, NavLinkProps } from 'react-bootstrap';
import VisibilitySensor from 'react-visibility-sensor';
import React from 'react';

interface ScrollSpyContentInterface extends HTMLAttributes<HTMLDivElement> {
  offset?: { top?: number; left?: number; bottom?: number; right?: number };
  minTopValue?: number;
  partialVisibility?: boolean;
}

const ScrollSpy = ({ children }: PropsWithChildren) => {
  return <ScrollSpyProvider>{children}</ScrollSpyProvider>;
};

const ScrollSpyContent = ({
  id,
  children,
  minTopValue,
  offset,
  partialVisibility = true,
  ...rest
}: PropsWithChildren<ScrollSpyContentInterface>) => {
  const { setActiveElemId, setVisibleItems, visibleItems } =
    useScrollSpyContext();

  const handleChange = (visible: boolean) => {
    if (visible && id) {
      setVisibleItems(prev => [...prev.filter(item => item !== id), id]);
    } else {
      setVisibleItems(prev => prev.filter(item => item !== id));
    }
  };

  useEffect(() => {
    if (visibleItems.length > 1) {
      setActiveElemId(visibleItems[1]);
    } else {
      setActiveElemId(visibleItems[0]);
    }
  }, [visibleItems]);

  return (
    <VisibilitySensor
      onChange={handleChange}
      minTopValue={minTopValue}
      partialVisibility={partialVisibility}
      offset={offset}
    >
      <div id={id} {...rest}>
        {children}
      </div>
    </VisibilitySensor>
  );
};

const ScrollSpyNavLink = ({
  className,
  href,
  children
}: PropsWithChildren<NavLinkProps>) => {
  const { activeElemId } = useScrollSpyContext();

  return (
    <Nav.Link
      className={classNames(className)}
      active={activeElemId === href?.slice(1)}
      href={href}
    >
      {children}
    </Nav.Link>
  );
};

ScrollSpy.Content = ScrollSpyContent;
ScrollSpy.NavLink = ScrollSpyNavLink;

export default ScrollSpy;
