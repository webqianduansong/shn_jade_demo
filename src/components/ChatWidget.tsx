"use client";
import { useState } from 'react';
import { Button, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import './ChatWidget/ChatWidget.css';

/**
 * 聊天小部件组件
 * 参考GRANSKY JEWELLERY的聊天功能
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  return (
    <>
      {/* 聊天按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            type="primary"
            shape="circle"
            size="large"
            className="chat-widget-button"
            icon={<MessageOutlined className="text-lg" />}
            onClick={() => setIsOpen(!isOpen)}
          />
          {unreadCount > 0 && (
            <Badge 
              count={unreadCount} 
              size="small"
              className="absolute -top-1 -right-1"
            />
          )}
        </div>
      </div>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="chat-widget-modal">
          <div className="chat-widget-content">
            {/* 聊天头部 */}
            <div className="chat-widget-header">
              <div className="chat-widget-header-content">
                <div>
                  <h3 className="chat-widget-header-title">Chat</h3>
                  <p className="chat-widget-header-subtitle">We're online</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="chat-widget-close"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* 聊天内容 */}
            <div className="chat-widget-body">
              <div className="chat-widget-messages">
                <div className="chat-widget-message">
                  <p className="chat-widget-message-text">
                    Hi! How can I help you with your jade jewelry purchase today?
                  </p>
                </div>
                <div className="chat-widget-message-user">
                  <div className="chat-widget-message-user-content">
                    <p className="chat-widget-message-user-text">
                      I'm interested in the jade earrings. Can you tell me more about them?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 输入框 */}
            <div className="chat-widget-input">
              <div className="chat-widget-input-container">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="chat-widget-input-field"
                />
                <Button type="primary" size="small" className="chat-widget-send-button">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
