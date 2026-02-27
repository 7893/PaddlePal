import type { FC } from 'hono/jsx';
import { Layout, Nav, PageWrapper, Footer, EmptyState } from '../components/layout';
import { EventCard } from '../components/match';

type Event = {
  id: number;
  key: string;
  title: string;
  type: string;
  stage: string;
  playerCount: number;
  matchCount: number;
  finished: number;
};

export const EventListPage: FC<{ events: Event[] }> = ({ events }) => (
  <Layout title="比赛项目">
    <Nav current="/events" title="比赛项目" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        {events.length > 0 ? (
          <div class="grid gap-5">
            {events.map((e) => (
              <EventCard
                title={e.title}
                type={e.type}
                stage={e.stage}
                playerCount={e.playerCount}
                finished={e.finished}
                total={e.matchCount}
                eventKey={e.key}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="🏆" title="暂无比赛项目" />
        )}
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
