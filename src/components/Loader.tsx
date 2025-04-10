import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="bouncing-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.8);

  .bouncing-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .bouncing-loader > div {
    width: 12px;
    height: 12px;
    background-color: #004dff;
    border-radius: 50%;
    animation: bouncing-loader 0.6s infinite alternate;
  }

  .bouncing-loader > div:nth-child(2) {
    animation-delay: 0.2s;
  }

  .bouncing-loader > div:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bouncing-loader {
    to {
      transform: translateY(-12px);
    }
  }
`;

export default Loader;
