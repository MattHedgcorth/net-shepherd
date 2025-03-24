import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.svg`
  height: 40px;
  width: 240px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserName = styled.span`
  font-size: 1rem;
  color: #ffffff;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2d2d42;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #ffffff;
`;

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <Link to="/">
          <Logo viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00B4E6"/>
              <stop offset="60%" stopColor="#4169E1"/>
              <stop offset="100%" stopColor="#9932CC"/>
            </linearGradient>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B4E6"/>
              <stop offset="100%" stopColor="#4169E1"/>
            </linearGradient>
          </defs>
          
          {/* Icon */}
          <g transform="translate(10, 10) scale(0.8)">
            <path d="M40,0 L80,23 L80,69 L40,92 L0,69 L0,23 Z"
                  fill="url(#iconGradient)"
                  transform="rotate(30, 40, 46)"/>
            <path d="M30,20 L50,20 L60,40 L50,60 L30,60 L20,40 Z"
                  fill="white"
                  transform="rotate(30, 40, 46)"/>
          </g>
          
          {/* Text */}
          <text x="100" y="65" fill="url(#textGradient)" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold">
            NetShepherd<tspan fill="#9932CC">.Cloud</tspan>
          </text>
          </Logo>
        </Link>
      </LogoContainer>
      {user && (
        <UserSection>
          <UserName>{user.name}</UserName>
          <UserAvatar>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              getInitials(user.name)
            )}
          </UserAvatar>
        </UserSection>
      )}
    </HeaderContainer>
  );
};

export default Header;