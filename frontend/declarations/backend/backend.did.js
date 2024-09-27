export const idlFactory = ({ IDL }) => {
  const TokenInfo = IDL.Record({
    'balance' : IDL.Float64,
    'name' : IDL.Text,
    'price' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'getTokens' : IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, TokenInfo))], []),
    'getTotalValue' : IDL.Func([], [IDL.Float64], []),
    'updateTokenInfo' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Float64],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
