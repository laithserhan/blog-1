import styled from 'styled-components';
import { COLORS } from '../constants';

export default styled.em`
  font-family: 'Sriracha';
  font-size: 0.9em;
  color: ${props => props.color || COLORS.yellow[700]};
`;