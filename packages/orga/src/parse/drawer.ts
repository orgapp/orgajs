import { Drawer } from '../types'
import { Lexer } from '../tokenize'
import * as ast from './utils';
import utils, {
  last,
  manyTill,
  seq2d,
} from './utils';
import { DrawerBegin, DrawerEnd } from '../tokenize/types';

export default (lexer: Lexer): Drawer | undefined => {

  const { peek, eat, substring } = lexer
  const { returning, tryTo } = utils(lexer);

  const drawerBegin = (): DrawerBegin | undefined => {
    const begin = peek();
    if (begin && begin.type === 'drawer.begin') {
      eat();
      return begin;
    }
  };

  const drawerEnd = (): DrawerEnd | undefined => {
    const end = peek();
    if (end && end.type === 'drawer.end') {
      eat();
      return end;
    }
  };

  const drawer = seq2d<DrawerBegin, DrawerEnd>(drawerBegin, (_begin) =>
    last(manyTill(() => {
      const n = peek();
      if (!n || n.type === 'stars') return;
      eat();
      return 'ok';
    }, drawerEnd)));

  const startEnd = returning(tryTo(drawer))();
  if (startEnd) {
    const begin = startEnd[0];
    const end = startEnd[1];
    eat('newline');
    return ast.drawer(begin.name, substring({
      start: begin.position.end,
      end: end.position.start
    }).trim(), {
      position: {
        start: begin.position.start,
        end: end.position.end,
      }
    });
  }
}
