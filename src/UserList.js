import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { API_URL, USERS_ENDPOINT, WS_API_URL } from './constants';
import { downloadFileFromURL } from './utils';

const UserList = () => {
  const [users, setUsers] = useState({ items: [], total: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 }); // Default page size

  useEffect(() => {
    const fetchUsers = () => {
      const { current, pageSize } = pagination;

      fetch(`${API_URL}${USERS_ENDPOINT}?page=${current}&size=${pageSize}`)
        .then(response => response.json())
        .then(data => {
          setUsers({ items: data.items, total: data.total });
        });
    };

    fetchUsers();
  }, [pagination]);

  const handleDownload = (user_id) => {
    // Hit WebSocket endpoint to initiate file download
    // const socket = new WebSocket(`${WS_API_URL}${ORDERS_ENDPOINT}/${user_id}/download`);
    const socket = new WebSocket(`${WS_API_URL}/ws`);
    const handshake_json = {
      "command": "subscribe",
      "identifier": "{\"channel\": \"DownloadChannel\",\"action\": \"download_orders\"}",
    }
    const download_orders_json = {
      "command": "message",
      "identifier": handshake_json.identifier,
      "data": "{\"action\": \"download_orders\", \"args\": \"{\\\"user_id\\\": "+user_id+"}\"}"
    }
    
    socket.onmessage = (event) => {
      const event_data = event.data;
      const json_data = JSON.parse(event_data);
      if (json_data.type === 'welcome') {
        socket.send(JSON.stringify(handshake_json))
        return
      } 
      if (json_data.type === 'confirm_subscription') {
        socket.send(JSON.stringify(download_orders_json))
        return
      }
      if (json_data.message !== undefined && json_data.message.file !== undefined) {
        // get the url from the message
        downloadFileFromURL(json_data.message.file);
      } else if ((json_data.type !== 'ping' && json_data.type !== 'welcome' && json_data.type !== 'confirm_subscription')) {
        // get the url from the message
        message.info(json_data.message, json_data.type);
      }
    };
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (text, record) => (
        <Button
          type="primary"
          shape="circle"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.id)}
        />
      ),
    },
  ];

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ current, pageSize });
  };


  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>User Orders Page</h1>
      <Table
        columns={columns}
        dataSource={users.items}
        pagination={{
          total: users.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: handlePaginationChange,
        }}
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '60%', margin: '0 auto' }}
        scroll={{ y: 400 }}
        rowKey="id"
      />
    </div>
  );
};

export default UserList;
