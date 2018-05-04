import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { iosHome } from 'react-icons-kit/ionicons/iosHome';
import { iosHomeOutline } from 'react-icons-kit/ionicons/iosHomeOutline';

import { COLORS, Z_INDICES } from '../constants';
import { humanizeDate } from '../helpers/date.helpers';
import { clamp } from '../utils';

import ClickableIcon from './ClickableIcon';

const HEIGHT = 50;
const BUFFER = 75;

// TODO: Right now, 3 things are dependent on a scroll threshold:
//   - This Header
//   - LargeScreenSidebar
//   - BaseHero
//
// It would be great if all 3 drew on the same value (even if the numbers
// aren't identical, they should all be derived from the same root value).
const SCROLL_THRESHOLD = 66;

const getIsWithinVisibleRange = scrollAmount =>
  scrollAmount / window.innerHeight * 100 > SCROLL_THRESHOLD;

class Header extends PureComponent {
  state = {
    isWithinVisibleRange: false,
    translateAmount: 0,
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    this.scrollPosition = window.scrollY;
    this.lockedScrollPosition = null;
    this.scrollDirection = 'down';
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    const currentScrollPosition = window.scrollY;

    const isWithinVisibleRange = getIsWithinVisibleRange(currentScrollPosition);
    if (isWithinVisibleRange !== this.state.isWithinVisibleRange) {
      this.setState({ isWithinVisibleRange });
    }

    const currentScrollDirection =
      currentScrollPosition > this.scrollPosition ? 'down' : 'up';

    if (this.scrollDirection === 'down' && currentScrollDirection === 'up') {
      // We don't want to allow the locked position to be changed if we're
      // in the middle of showing/hiding the header; this causes an odd glitchy
      // effect.
      const isMidReveal = this.state.translateAmount !== 0;

      if (!isMidReveal) {
        this.lockedScrollPosition = this.scrollPosition;
      }
    } else if (
      this.scrollDirection === 'up' &&
      currentScrollDirection === 'down'
    ) {
      const isMidReveal = this.state.translateAmount !== HEIGHT + BUFFER;

      if (!isMidReveal) {
        this.lockedScrollPosition = this.scrollPosition + HEIGHT + BUFFER;
      }
    }

    const translateAmount = clamp(
      this.lockedScrollPosition - currentScrollPosition,
      0,
      HEIGHT + BUFFER
    );

    this.scrollDirection = currentScrollDirection;
    this.scrollPosition = currentScrollPosition;

    if (translateAmount !== this.state.translateAmount) {
      this.setState({ translateAmount });
    }
  };

  render() {
    const { title, publishedOn, heroStyle } = this.props;
    const { translateAmount, isWithinVisibleRange } = this.state;

    // TODO: color should depend on heroStyle.
    // Also, `heroStyle` should be renamed.
    const color = COLORS.pink[300];

    return (
      <Wrapper
        style={{
          transform: `translateY(${translateAmount}px)`,
          opacity: isWithinVisibleRange ? 1 : 0,
        }}
      >
        <IconWrapper>
          <ClickableIcon
            href="/"
            icon={iosHomeOutline}
            iconHover={iosHome}
            size={32}
            color={COLORS.gray[300]}
            colorHover={COLORS.white}
          />
        </IconWrapper>

        <span>
          <Title color={color}>{title}</Title>
          <Date>{humanizeDate(publishedOn)}</Date>
        </span>
      </Wrapper>
    );
  }
}

const Wrapper = styled.header`
  position: fixed;
  z-index: ${Z_INDICES.header};
  display: flex;
  justify-content: center;
  align-items: center;
  top: ${-HEIGHT - BUFFER + 10}px;
  left: 10px;
  right: 10px;
  height: ${HEIGHT}px;
  color: ${COLORS.gray[300]};
  background: ${COLORS.gray[800]};
  transition: opacity 250ms;
  will-change: transform;
`;

const Title = styled.span`
  color: ${props => props.color || COLORS.white};
  font-weight: 600;
  font-size: 1.5rem;
`;

const Date = styled.span`
  display: inline-block;
  padding-left: 1rem;
  font-size: 1rem;
`;

const IconWrapper = styled.div`
  position: absolute;
  width: 32px;
  height: 32px;
  left: 12px;
  top: 0;
  bottom: 0;
  margin: auto;
`;

export default Header;
