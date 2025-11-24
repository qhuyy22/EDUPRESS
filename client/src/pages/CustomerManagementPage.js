/**
 * CustomerManagementPage Component
 * Admin page to manage all customers - view, search, filter, ban/unban
 *
 * Bản dịch giao diện sang tiếng Việt (Vietnamese Translation)
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import './CustomerManagementPage.css';

const CustomerManagementPage = () => {
  const [users, setUsers] = useState([]); // Renamed from customers to users for better reflection of roleFilter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, banned
  const [roleFilter, setRoleFilter] = useState('customer'); // all, customer, provider - default to customer for this page
  
  // Edit modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });


  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, role: roleFilter, search: searchTerm }
      });

      // Backend returns { success, count, data } - we need the data array
      setUsers(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Tải danh sách người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${newStatus === 'banned' ? 'cấm' : 'bỏ cấm'} người dùng này?`)) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      await api.put(`/admin/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(`Trạng thái người dùng đã được cập nhật thành công!`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ fullName: user.fullName, email: user.email });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.put(`/admin/users/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Thông tin người dùng đã được cập nhật thành công!');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'customer':
        return 'Học viên';
      case 'provider':
        return 'Giảng viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return 'Khách hàng';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'banned':
        return 'Bị cấm';
      default:
        return 'Không rõ';
    }
  };


  return (
    <div className="customer-management-page container">
      <header className="page-header">
        <h1>Quản lý Người dùng</h1>
      </header>

      {success && <Message type="success" message={success} />}
      {error && <Message type="error" message={error} />}

      <div className="controls">
        <div className="search-filter-group">
          <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Tìm kiếm
            </button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="customer">Học viên</option>
            <option value="provider">Giảng viên</option>
            <option value="all">Tất cả Người dùng</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị cấm</option>
          </select>
        </div>
      </div>

      <div className="user-list">
        {loading ? (
          <Loader message="Đang tải danh sách người dùng..." />
        ) : users.length === 0 ? (
          <Message type="info" message="Không tìm thấy người dùng nào." />
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên đầy đủ</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{getRoleText(user.role)}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-edit btn-sm"
                      onClick={() => handleEdit(user)}
                    >
                      Chỉnh sửa
                    </button>
                    {user.status === 'active' ? (
                      <button
                        className="btn-ban btn-sm"
                        onClick={() => handleStatusChange(user._id, 'banned')}
                      >
                        Cấm
                      </button>
                    ) : (
                      <button
                        className="btn-unban btn-sm"
                        onClick={() => handleStatusChange(user._id, 'active')}
                      >
                        Bỏ cấm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chỉnh sửa Người dùng</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Tên đầy đủ</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">Lưu thay đổi</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;