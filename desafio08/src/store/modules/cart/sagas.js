import { Alert } from 'react-native';
import { call, put, all, takeLatest, select } from 'redux-saga/effects';
import Intl from 'intl';
import api from '../../../services/api';
import 'intl/locale-data/jsonp/pt-BR';
import { formatPrice } from '../../../util/format';
import NavigationService from '../../../services/navigation';

import { addToCartSucess, updateAmountSucess } from './actions';

function* addToCart({ id }) {
  const productExist = yield select(state => state.cart.find(p => p.id === id));

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currenctAmount = productExist ? productExist.amount : 0;

  const amount = currenctAmount + 1;

  if (amount > stockAmount) {
    Alert.alert('ERROR', 'Quantidade solicitada fora de estoque');
    return;
  }

  if (productExist) {
    yield put(updateAmountSucess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSucess(data));

    NavigationService.navigate('Cart');
  }
}

function* updateAmount({ id, amount }) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `/stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    Alert.alert('ERROR', 'Quantidade solicitada fora de estoque');
    return;
  }

  yield put(updateAmountSucess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
