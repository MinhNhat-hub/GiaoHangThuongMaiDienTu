import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATHS, SCREEN_NAMES } from '@/constants/routes';
import { TEST_IDS } from '@/constants/test-ids';

export const App: React.FC = () => {
  return (
    <div className="bg-card rounded-2xl border border-mint-secondary/20 p-8 shadow-sm space-y-4">
      <h1
        data-testid={TEST_IDS.COMMON.SCREEN_TITLE}
        className="text-2xl font-bold text-mint-primary"
      >
        {SCREEN_NAMES.CUSTOMER_HOME}
      </h1>
      <p className="text-sm text-mint-secondary">
        Theo dõi tiến trình vận chuyển và quản lý đơn hàng của bạn.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to={APP_PATHS.orderCreation}
          data-testid={TEST_IDS.ORDER.CREATE_BUTTON}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-mint-tertiary text-white hover:bg-mint-tertiary-hover active:bg-mint-tertiary-active transition-colors"
        >
          Tạo đơn hàng mới
        </Link>
      </div>
    </div>
  );
};

export default App;
