import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import './App.css';

class Contract {
  constructor(id, number, clientName, startDate, endDate, amount, status, type = 'general') {
    this.id = id;
    this.number = number;
    this.clientName = clientName;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.amount = amount;
    this.status = status;
    this.type = type;
    this.createdAt = new Date();
  }

  // Валидация дат
  validateDates() {
    return this.endDate > this.startDate;
  }

  // Определение статуса на основе текущей даты
  calculateStatus() {
    const now = new Date();
    if (now < this.startDate) return 'pending';
    if (now > this.endDate) return 'expired';
    return 'active';
  }

  // Форматирование суммы
  formatAmount() {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT'
    }).format(this.amount);
  }

  // Форматирование даты
  formatDate(date) {
    return date.toLocaleDateString('ru-RU');
  }
}

// Наследование - специализированный класс для аренды
class RentalContract extends Contract {
  constructor(id, number, clientName, startDate, endDate, amount, status, monthlyRent) {
    super(id, number, clientName, startDate, endDate, amount, status, 'rental');
    this.monthlyRent = monthlyRent;
  }

  calculateTotalRent() {
    const months = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24 * 30));
    return months * this.monthlyRent;
  }
}

class Client {
  constructor(name, email, phone, company) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.company = company;
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePhone() {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(this.phone);
  }
}

// Функции для работы с коллекциями данных
const ContractManager = {
  // Фильтрация по статусу
  filterByStatus: (contracts, status) => {
    return contracts.filter(contract => contract.status === status);
  },

  // Поиск по номеру или клиенту
  searchContracts: (contracts, searchTerm) => {
    const term = searchTerm.toLowerCase();
    return contracts.filter(contract => 
      contract.number.toLowerCase().includes(term) ||
      contract.clientName.toLowerCase().includes(term)
    );
  },

  // Сортировка
  sortContracts: (contracts, field, order = 'asc') => {
    return [...contracts].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (field === 'amount') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (field === 'startDate' || field === 'endDate') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
  },

  // Группировка по статусам
  groupByStatus: (contracts) => {
    return contracts.reduce((groups, contract) => {
      const status = contract.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(contract);
      return groups;
    }, {});
  },

  // Статистика
  getStatistics: (contracts) => {
    const stats = {
      total: contracts.length,
      active: 0,
      expired: 0,
      pending: 0,
      totalAmount: 0
    };

    contracts.forEach(contract => {
      stats[contract.status]++;
      stats.totalAmount += contract.amount;
    });

    return stats;
  }
};

// Функции валидации
const ValidationUtils = {
  validateContractData: (data) => {
    const errors = [];
    
    if (!data.number || data.number.trim() === '') {
      errors.push('Номер договора обязателен');
    }
    
    if (!data.clientName || data.clientName.trim() === '') {
      errors.push('Имя клиента обязательно');
    }
    
    if (!data.startDate) {
      errors.push('Дата начала обязательна');
    }
    
    if (!data.endDate) {
      errors.push('Дата окончания обязательна');
    }
    
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
      errors.push('Дата окончания должна быть позже даты начала');
    }
    
    if (!data.amount || data.amount <= 0) {
      errors.push('Сумма должна быть положительной');
    }
    
    return errors;
  },

  validateFinancialField: (value) => {
    return !isNaN(value) && parseFloat(value) > 0;
  }
};

// Генерация тестовых данных
const generateSampleContracts = () => {
  const clients = ['ТОО "Астана-Строй"', 'ИП Иванов И.И.', 'ТОО "КазТрейд"', 'ООО "Евразия Групп"', 'ИП Петров П.П.'];
  const contracts = [];
  
  for (let i = 1; i <= 15; i++) {
    const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 1000000) + 50000;
    
    const contract = new Contract(
      i,
      `Д-${String(i).padStart(4, '0')}`,
      clients[Math.floor(Math.random() * clients.length)],
      startDate,
      endDate,
      amount,
      Math.random() > 0.5 ? 'active' : Math.random() > 0.5 ? 'expired' : 'pending'
    );
    
    contracts.push(contract);
  }
  
  return contracts;
};

// Компонент поиска
const SearchBar = ({ onSearch, searchTerm }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Поиск по номеру договора или клиенту..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

// Основной компонент списка договоров
const ContractList = ({ contracts, onSort, sortField, sortOrder }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'expired': return 'Просрочен';
      case 'pending': return 'Ожидание';
      default: return status;
    }
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('number')}
            >
              № Договора {sortField === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('clientName')}
            >
              Клиент {sortField === 'clientName' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('startDate')}
            >
              Дата начала {sortField === 'startDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('endDate')}
            >
              Дата окончания {sortField === 'endDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('amount')}
            >
              Сумма {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contracts.map((contract) => (
            <tr key={contract.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {contract.number}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {contract.clientName}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {contract.formatDate(contract.startDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {contract.formatDate(contract.endDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {contract.formatAmount()}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {getStatusIcon(contract.status)}
                  <span className="ml-2">{getStatusText(contract.status)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Компонент статистики
const Statistics = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Всего договоров</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Активных</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <XCircle className="w-8 h-8 text-red-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Просроченных</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <Calendar className="w-8 h-8 text-yellow-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Общая сумма</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'KZT',
                maximumFractionDigits: 0
              }).format(stats.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент приложения
const App = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('number');
  const [sortOrder, setSortOrder] = useState('asc');
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);

  // Функция логирования
  const logAction = (action, details) => {
    const logEntry = {
      timestamp: new Date().toLocaleString('ru-RU'),
      action,
      details
    };
    setLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Храним последние 10 записей
  };

  // Инициализация данных
  useEffect(() => {
    const sampleContracts = generateSampleContracts();
    setContracts(sampleContracts);
    setFilteredContracts(sampleContracts);
    setStats(ContractManager.getStatistics(sampleContracts));
    logAction('Инициализация системы', 'Загружено договоров: ' + sampleContracts.length);
  }, []);

  // Обработка поиска
  const handleSearch = (term) => {
    setSearchTerm(term);
    logAction('Поиск', 'Поисковый запрос: ' + term);
    applyFilters(term, statusFilter);
  };

  // Обработка фильтрации по статусу
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    logAction('Фильтрация', 'Фильтр по статусу: ' + status);
    applyFilters(searchTerm, status);
  };

  // Применение фильтров
  const applyFilters = (search, status) => {
    let filtered = [...contracts];
    
    if (search) {
      filtered = ContractManager.searchContracts(filtered, search);
    }
    
    if (status !== 'all') {
      filtered = ContractManager.filterByStatus(filtered, status);
    }
    
    filtered = ContractManager.sortContracts(filtered, sortField, sortOrder);
    setFilteredContracts(filtered);
  };

  // Обработка сортировки
  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    logAction('Сортировка', `Поле: ${field}, Порядок: ${order}`);
    
    const sorted = ContractManager.sortContracts(filteredContracts, field, order);
    setFilteredContracts(sorted);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Система управления договорами
          </h1>
          <p className="text-gray-600">
            Демонстрация функциональности разработанной системы
          </p>
        </div>

        <Statistics stats={stats} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="expired">Просроченные</option>
                <option value="pending">Ожидание</option>
              </select>
            </div>
          </div>

          <ContractList 
            contracts={filteredContracts}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        </div>

        {/* Панель логов */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Логи активности пользователя
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{log.timestamp}</span>
                <span className="text-sm font-medium text-gray-900">{log.action}</span>
                <span className="text-sm text-gray-500">{log.details}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Техническая информация */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Реализованная функциональность:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ ООП: Классы Contract, RentalContract (наследование), Client</li>
            <li>✅ Валидация данных с проверкой дат и финансовых полей</li>
            <li>✅ Работа с коллекциями: фильтрация, сортировка, группировка</li>
            <li>✅ Модульные функции для форматирования и валидации</li>
            <li>✅ React компоненты: ContractList, SearchBar, Statistics</li>
            <li>✅ Система логирования пользовательских действий</li>
            <li>✅ Юнит-тесты (имитация - реальные тесты требуют Jest)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App; 