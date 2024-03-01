import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { API_URL, USERS_ENDPOINT, ORDERS_ENDPOINT, WS_API_URL } from './constants';
import { jsonToCsv } from './utils';

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
    const socket = new WebSocket(`${WS_API_URL}${ORDERS_ENDPOINT}/${user_id}/download`);

    socket.onmessage = (event) => {
      const event_data = event.data;
      // check if the string is json stirng
      // console.log(typeof(event_data));
      if (event_data.startsWith('{')) {
        const jsonData = JSON.parse(event.data);
        const csvData = jsonToCsv(jsonData.orders);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${user_id}_orders_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        message.info(event_data);
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      />
    </div>
  );
};

export default UserList;
